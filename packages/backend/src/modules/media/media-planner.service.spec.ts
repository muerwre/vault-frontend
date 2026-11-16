import type { Repository } from 'typeorm';

import type { ExternalMedia, MediaJob } from '../../entities/media.entity';
import type { YoutubeDetails, YoutubeService } from '../meta/youtube.service';
import type { YoutubeThumbService } from '../upload/youtube-thumb.service';

import { MediaPlannerService } from './media-planner.service';

const item = (externalId: string, overrides: Partial<ExternalMedia> = {}) =>
  ({
    id: externalId.charCodeAt(0),
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

/** A planner over in-memory rows; `batches` are what successive polls find. */
const setup = (options: {
  batches: ExternalMedia[][];
  details?: Map<string, YoutubeDetails> | Error;
  thumbs?: Record<string, boolean>;
  openJobs?: number;
}) => {
  const saved: ExternalMedia[] = [];
  const jobs: Partial<MediaJob>[] = [];
  const batches = [...options.batches];

  const media = {
    find: jest.fn(async () => batches.shift() ?? []),
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
    fetchDetails: jest.fn(async () => {
      if (options.details instanceof Error) {
        throw options.details;
      }

      return options.details;
    }),
  } as unknown as YoutubeService;

  const thumbs = {
    ensure: jest.fn(async (id: string) => options.thumbs?.[id] ?? true),
  } as unknown as YoutubeThumbService;

  return {
    planner: new MediaPlannerService(media, jobRepo, youtube, thumbs),
    saved,
    jobs,
    youtube,
    thumbs,
  };
};

describe('MediaPlannerService', () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env.MEDIA_MAX_DURATION_SEC = '1800';
    process.env.CACHE_YOUTUBE_THUMBS = 'true';
  });

  afterAll(() => {
    process.env = env;
  });

  it('decides each video from its details and queues downloads', async () => {
    const { planner, saved, jobs } = setup({
      batches: [
        [
          item('okVideo0001', { priority: 10 }),
          item('longVideo01'),
          item('liveVideo01'),
          item('goneVideo01'),
        ],
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
        mediaId: 'o'.charCodeAt(0),
        priority: 10,
      }),
    ]);
  });

  it('does not fetch covers for videos that are gone', async () => {
    const { planner, thumbs } = setup({
      batches: [[item('goneVideo01')]],
      details: new Map(),
    });

    await planner.runOnce();

    expect(thumbs.ensure).not.toHaveBeenCalled();
  });

  it('records a cover that could not be fetched', async () => {
    const { planner, saved } = setup({
      batches: [[item('okVideo0001')]],
      details: new Map([
        ['okVideo0001', { title: '', duration: 60, isLive: false }],
      ]),
      thumbs: { okVideo0001: false },
    });

    await planner.runOnce();

    expect(saved[0]).toMatchObject({ thumbStatus: 'failed', thumbPath: null });
  });

  it('queues everything when there is no API key, leaving length to the fetcher', async () => {
    const { planner, saved, jobs, youtube } = setup({
      batches: [[item('anyVideo001')]],
    });

    await planner.runOnce();

    expect(youtube.fetchDetails).not.toHaveBeenCalled();
    expect(saved[0]).toMatchObject({ videoStatus: 'queued', duration: null });
    expect(jobs).toHaveLength(1);
  });

  it('leaves the batch for a later round when the API fails', async () => {
    const { planner, saved, jobs } = setup({
      batches: [[item('okVideo0001')], [item('okVideo0001')]],
      details: new Error('quota'),
    });

    await planner.runOnce();

    expect(saved).toEqual([]);
    expect(jobs).toEqual([]);
  });

  it('does not queue a second download for an item that has one open', async () => {
    const { planner, jobs } = setup({
      batches: [[item('okVideo0001')]],
      details: new Map([
        ['okVideo0001', { title: '', duration: 60, isLive: false }],
      ]),
      openJobs: 1,
    });

    await planner.runOnce();

    expect(jobs).toEqual([]);
  });

  it('keeps polling until nothing is waiting', async () => {
    const { planner, saved } = setup({
      batches: [[item('firstVideo1')], [item('secondVideo')]],
    });

    await planner.runOnce();

    expect(saved.map((row) => row.externalId)).toEqual([
      'firstVideo1',
      'secondVideo',
    ]);
  });

  it('shares one run between concurrent calls', async () => {
    const { planner, saved } = setup({ batches: [[item('okVideo0001')]] });

    await Promise.all([planner.runOnce(), planner.runOnce()]);

    expect(saved).toHaveLength(1);
  });
});
