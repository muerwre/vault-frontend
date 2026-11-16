import { SchedulerRegistry } from '@nestjs/schedule';
import type { FindManyOptions, FindOperator, Repository } from 'typeorm';

import type { ExternalMedia, MediaJob } from '../../entities/media.entity';
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

  const thumbs = {
    ensure: jest.fn(async (id: string) => options.thumbs?.[id] ?? true),
  } as unknown as YoutubeThumbService;

  const scheduler = new SchedulerRegistry();

  return {
    planner: new MediaPlannerService(media, jobRepo, thumbs, scheduler),
    saved,
    jobs,
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
    it('queues every video for download and stores its cover', async () => {
      const ok = fresh('okVideo0001');
      const { planner, saved, jobs } = setup({ rows: [ok] });

      await planner.runOnce();

      expect(saved[0]).toMatchObject({
        kind: 'video',
        videoStatus: 'queued',
        thumbStatus: 'ready',
        thumbPath: 'youtube/okVideo0001.jpg',
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

    it('records a cover that could not be fetched, and queues anyway', async () => {
      const { planner, saved, jobs } = setup({
        rows: [fresh('goneVideo01')],
        thumbs: { goneVideo01: false },
      });

      await planner.runOnce();

      expect(saved[0]).toMatchObject({
        videoStatus: 'queued',
        thumbStatus: 'failed',
        thumbPath: null,
      });
      expect(jobs).toHaveLength(1);
    });

    it('leaves covers alone while the cover cache is off', async () => {
      process.env.CACHE_YOUTUBE_THUMBS = 'false';
      const { planner, saved, thumbs } = setup({
        rows: [fresh('okVideo0001')],
      });

      await planner.runOnce();

      expect(thumbs.ensure).not.toHaveBeenCalled();
      expect(saved[0]).toMatchObject({
        videoStatus: 'queued',
        thumbStatus: 'none',
      });
    });

    it('does not queue a second download for an item that has one open', async () => {
      const { planner, jobs } = setup({
        rows: [fresh('okVideo0001')],
        openJobs: 1,
      });

      await planner.runOnce();

      expect(jobs).toEqual([]);
    });

    it('keeps planning until nothing fresh is waiting', async () => {
      const rows = Array.from({ length: 120 }, (_, index) =>
        fresh(String(index).padStart(11, 'v')),
      );
      const { planner, jobs } = setup({ rows });

      await planner.runOnce();

      expect(rows.every((row) => row.videoStatus === 'queued')).toBe(true);
      expect(jobs).toHaveLength(120);
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
