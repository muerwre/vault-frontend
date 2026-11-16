import { SchedulerRegistry } from '@nestjs/schedule';
import type { FindManyOptions, FindOperator, Repository } from 'typeorm';

import type { ExternalMedia, MediaJob } from '../../entities/media.entity';
import type { YoutubeDetails, YoutubeService } from '../meta/youtube.service';
import type { YoutubeThumbService } from '../upload/youtube-thumb.service';

import { MediaPlannerService } from './media-planner.service';

let nextId = 1;

const item = (externalId: string, overrides: Partial<ExternalMedia> = {}) =>
  ({
    id: nextId++,
    provider: 'youtube',
    externalId,
    kind: 'unknown',
    videoStatus: 'none',
    skipReason: null,
    thumbStatus: 'none',
    priority: 0,
    thumbPath: null,
    duration: null,
    ...overrides,
  }) as ExternalMedia;

const fresh = (externalId: string) => item(externalId);
const backlog = (externalId: string) => item(externalId, { priority: 10 });

/** Matches a stored priority against an exact value or a `MoreThan`. */
const priorityMatches = (
  value: number,
  wanted: number | FindOperator<number> | undefined,
) => {
  if (wanted === undefined) {
    return true;
  }

  return typeof wanted === 'number' ? value === wanted : value > wanted.value;
};

/** A planner over in-memory rows, which it updates as it saves them. */
const setup = (options: {
  rows: ExternalMedia[];
  details?: Map<string, YoutubeDetails> | Error;
  thumbs?: Record<string, boolean>;
  openJobs?: number;
}) => {
  const rows = options.rows;
  const saved: ExternalMedia[] = [];
  const jobs: Partial<MediaJob>[] = [];

  const media = {
    find: jest.fn(async ({ where, take }: FindManyOptions<ExternalMedia>) => {
      const filter = where as {
        videoStatus: string;
        priority?: number | FindOperator<number>;
      };

      return rows
        .filter(
          (row) =>
            row.videoStatus === filter.videoStatus &&
            priorityMatches(row.priority, filter.priority),
        )
        .sort((a, b) => a.priority - b.priority || a.id - b.id)
        .slice(0, take);
    }),
    save: jest.fn(async (row: ExternalMedia) => {
      saved.push({ ...row });
      return row;
    }),
  } as unknown as Repository<ExternalMedia>;

  const jobRepo = {
    count: jest.fn(async () => options.openJobs ?? 0),
    create: jest.fn((row: Partial<MediaJob>) => row),
    save: jest.fn(async (row: Partial<MediaJob>) => {
      jobs.push(row);
      return row;
    }),
  } as unknown as Repository<MediaJob>;

  const youtube = {
    isConfigured: options.details !== undefined,
    fetchDetails: jest.fn(async (_ids: string[]) => {
      if (options.details instanceof Error) {
        throw options.details;
      }

      return options.details;
    }),
  } as unknown as YoutubeService;

  const thumbs = {
    ensure: jest.fn(async (id: string) => options.thumbs?.[id] ?? true),
  } as unknown as YoutubeThumbService;

  const scheduler = new SchedulerRegistry();

  return {
    planner: new MediaPlannerService(
      media,
      jobRepo,
      youtube,
      thumbs,
      scheduler,
    ),
    saved,
    jobs,
    youtube,
    thumbs,
    scheduler,
  };
};

const statusOf = (rows: ExternalMedia[]) =>
  Object.fromEntries(rows.map((row) => [row.externalId, row.videoStatus]));

describe('MediaPlannerService', () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...env,
      MEDIA_MAX_DURATION_SEC: '1800',
      CACHE_YOUTUBE_THUMBS: 'true',
    };
  });

  afterAll(() => {
    process.env = env;
  });

  describe('fresh items', () => {
    it('decides each video from its details and queues downloads', async () => {
      const ok = fresh('okVideo0001');
      const { planner, saved, jobs } = setup({
        rows: [
          ok,
          fresh('longVideo01'),
          fresh('liveVideo01'),
          fresh('goneVideo01'),
        ],
        details: new Map([
          ['okVideo0001', { title: '', duration: 600, isLive: false }],
          ['longVideo01', { title: '', duration: 3600, isLive: false }],
          ['liveVideo01', { title: '', duration: null, isLive: true }],
        ]),
      });

      await planner.runOnce();

      const byId = new Map(saved.map((row) => [row.externalId, row]));

      expect(byId.get('okVideo0001')).toMatchObject({
        kind: 'video',
        videoStatus: 'queued',
        duration: 600,
        thumbStatus: 'ready',
        thumbPath: 'youtube/okVideo0001.jpg',
      });
      expect(byId.get('longVideo01')).toMatchObject({
        videoStatus: 'skipped',
        skipReason: 'too_long',
        thumbStatus: 'ready',
      });
      expect(byId.get('liveVideo01')).toMatchObject({
        videoStatus: 'skipped',
        skipReason: 'live',
      });
      expect(byId.get('goneVideo01')).toMatchObject({
        videoStatus: 'unavailable',
        thumbStatus: 'none',
      });

      expect(jobs).toEqual([
        expect.objectContaining({
          kind: 'download',
          mediaId: ok.id,
          priority: 0,
        }),
      ]);
    });

    it('leaves backlog items alone', async () => {
      const rows = [fresh('freshVideo1'), backlog('oldVideo001')];
      const { planner } = setup({ rows });

      await planner.runOnce();

      expect(statusOf(rows)).toEqual({
        freshVideo1: 'queued',
        oldVideo001: 'none',
      });
    });

    it('does not fetch covers for videos that are gone', async () => {
      const { planner, thumbs } = setup({
        rows: [fresh('goneVideo01')],
        details: new Map(),
      });

      await planner.runOnce();

      expect(thumbs.ensure).not.toHaveBeenCalled();
    });

    it('records a cover that could not be fetched', async () => {
      const { planner, saved } = setup({
        rows: [fresh('okVideo0001')],
        details: new Map([
          ['okVideo0001', { title: '', duration: 60, isLive: false }],
        ]),
        thumbs: { okVideo0001: false },
      });

      await planner.runOnce();

      expect(saved[0]).toMatchObject({
        thumbStatus: 'failed',
        thumbPath: null,
      });
    });

    it('queues everything when there is no API key, leaving length to the fetcher', async () => {
      const { planner, saved, jobs, youtube } = setup({
        rows: [fresh('anyVideo001')],
      });

      await planner.runOnce();

      expect(youtube.fetchDetails).not.toHaveBeenCalled();
      expect(saved[0]).toMatchObject({ videoStatus: 'queued', duration: null });
      expect(jobs).toHaveLength(1);
    });

    it('leaves the batch for a later round when the API fails', async () => {
      const rows = [fresh('okVideo0001')];
      const { planner, saved, jobs } = setup({
        rows,
        details: new Error('quota'),
      });

      await planner.runOnce();

      expect(saved).toEqual([]);
      expect(jobs).toEqual([]);
      expect(rows[0].videoStatus).toBe('none');
    });

    it('does not queue a second download for an item that has one open', async () => {
      const { planner, jobs } = setup({
        rows: [fresh('okVideo0001')],
        details: new Map([
          ['okVideo0001', { title: '', duration: 60, isLive: false }],
        ]),
        openJobs: 1,
      });

      await planner.runOnce();

      expect(jobs).toEqual([]);
    });

    it('keeps planning until nothing fresh is waiting', async () => {
      const rows = Array.from({ length: 120 }, (_, index) =>
        fresh(String(index).padStart(11, 'v')),
      );
      const { planner, youtube } = setup({ rows, details: new Map() });

      await planner.runOnce();

      expect(rows.every((row) => row.videoStatus === 'unavailable')).toBe(true);
      expect(
        (youtube.fetchDetails as jest.Mock).mock.calls.map(
          ([ids]: [string[]]) => ids.length,
        ),
      ).toEqual([50, 50, 20]);
    });

    it('shares one run between concurrent calls', async () => {
      const { planner, saved } = setup({ rows: [fresh('okVideo0001')] });

      await Promise.all([planner.runOnce(), planner.runOnce()]);

      expect(saved).toHaveLength(1);
    });
  });

  describe('backlog', () => {
    it('releases one batch, oldest first, at backlog priority', async () => {
      process.env.MEDIA_BACKLOG_BATCH = '2';
      const rows = [
        backlog('oldVideo001'),
        backlog('oldVideo002'),
        backlog('oldVideo003'),
        fresh('freshVideo1'),
      ];
      const { planner, jobs } = setup({ rows });

      await planner.releaseBacklog();

      expect(statusOf(rows)).toEqual({
        oldVideo001: 'queued',
        oldVideo002: 'queued',
        oldVideo003: 'none',
        freshVideo1: 'none',
      });
      expect(jobs.map((job) => job.priority)).toEqual([10, 10]);
    });

    it('defaults to five items per release', async () => {
      const rows = Array.from({ length: 8 }, (_, index) =>
        backlog(`oldVideo00${index}`),
      );
      const { planner } = setup({ rows });

      await planner.releaseBacklog();

      expect(rows.filter((row) => row.videoStatus === 'queued')).toHaveLength(
        5,
      );
    });

    it('never plans an item twice when a release and a fresh round overlap', async () => {
      const rows = [fresh('freshVideo1'), backlog('oldVideo001')];
      const { planner, saved } = setup({ rows });

      await Promise.all([planner.runOnce(), planner.releaseBacklog()]);

      expect(saved.map((row) => row.externalId).sort()).toEqual([
        'freshVideo1',
        'oldVideo001',
      ]);
    });
  });

  describe('schedule', () => {
    it('releases the backlog at 06:00 by default, in the configured zone', async () => {
      process.env.CACHE_EXTERNAL_MEDIA = 'true';
      process.env.SCHEDULE_TIMEZONE = 'Asia/Novosibirsk';
      const { planner, scheduler } = setup({ rows: [] });

      planner.onApplicationBootstrap();

      const job = scheduler.getCronJob('media-backlog');
      expect(job.isActive).toBe(true);
      expect(job.cronTime.source).toBe('0 0 6 * * *');
      expect(job.cronTime.timeZone).toBe('Asia/Novosibirsk');

      await planner.onModuleDestroy();

      expect(scheduler.doesExist('cron', 'media-backlog')).toBe(false);
    });

    it('schedules nothing when the cache is off', async () => {
      process.env.CACHE_EXTERNAL_MEDIA = 'false';
      const { planner, scheduler } = setup({ rows: [] });

      planner.onApplicationBootstrap();

      expect(scheduler.getCronJobs().size).toBe(0);

      await planner.onModuleDestroy();
    });
  });
});
