import type { Repository } from 'typeorm';

import type { Embed } from '../../entities/embed.entity';
import type { File } from '../../entities/file.entity';
import type { ExternalMedia, MediaJob } from '../../entities/media.entity';

import { MetaService } from './meta.service';
import type { YoutubeService } from './youtube.service';

const embedRow = (id: number, address: string, title: string) =>
  ({ id, address, provider: 'youtube', metadata: { title } }) as Embed;

/** Captures the built query so cache lookups can be driven without a database. */
const mockRepo = (found: Embed[]) => {
  const saved: unknown[] = [];

  return {
    saved,
    createQueryBuilder: () => ({
      where() {
        return this;
      },
      andWhere() {
        return this;
      },
      orderBy() {
        return this;
      },
      getMany: async () => found,
    }),
    create: (value: unknown) => value,
    save: async (values: unknown[]) => {
      saved.push(...values);
      return values.map((v, i) => ({ ...(v as object), id: 100 + i }) as Embed);
    },
  } as unknown as Repository<Embed> & { saved: unknown[] };
};

const mockYoutube = (
  result: Map<
    string,
    { address: string; provider: 'youtube'; metadata: { title: string } }
  >,
  fail = false,
) =>
  ({
    fetchByIds: jest.fn(async (ids: string[]) => {
      if (fail) {
        throw new Error('quota exceeded');
      }
      void ids;
      return result;
    }),
  }) as unknown as YoutubeService & { fetchByIds: jest.Mock };

/** Media cache repositories holding `media` rows and `running` download jobs. */
const mediaRepos = (
  media: Partial<ExternalMedia>[] = [],
  running: Partial<MediaJob>[] = [],
) => ({
  media: {
    findBy: jest.fn(async () => media),
  } as unknown as Repository<ExternalMedia>,
  jobs: {
    findBy: jest.fn(async () => running),
  } as unknown as Repository<MediaJob>,
  files: {
    findBy: jest.fn(async () => [{ id: 99, size: 95 * 1024 * 1024 }]),
  } as unknown as Repository<File>,
});

const makeService = (
  embeds: Repository<Embed>,
  youtube: YoutubeService,
  repos = mediaRepos(),
) => new MetaService(embeds, youtube, repos.media, repos.jobs, repos.files);

describe('MetaService', () => {
  it('returns an empty map for no ids without touching the API', async () => {
    const youtube = mockYoutube(new Map());
    const service = makeService(mockRepo([]), youtube);

    await expect(service.getYoutubeEmbeds([])).resolves.toEqual({});
    expect(youtube.fetchByIds).not.toHaveBeenCalled();
  });

  it('ignores blank ids', async () => {
    const youtube = mockYoutube(new Map());
    const service = makeService(mockRepo([]), youtube);

    await expect(service.getYoutubeEmbeds(['', '  '])).resolves.toEqual({});
    expect(youtube.fetchByIds).not.toHaveBeenCalled();
  });

  it('serves cached embeds without calling the API', async () => {
    const youtube = mockYoutube(new Map());
    const service = makeService(
      mockRepo([embedRow(1, 'abc', 'Cached')]),
      youtube,
    );

    const items = await service.getYoutubeEmbeds(['abc']);

    expect(items.abc).toEqual({
      id: 1,
      provider: 'youtube',
      address: 'abc',
      metadata: { title: 'Cached', thumb: '', duration: '' },
    });
    expect(youtube.fetchByIds).not.toHaveBeenCalled();
  });

  it('fetches only the uncached ids and persists them', async () => {
    const youtube = mockYoutube(
      new Map([
        [
          'new',
          {
            address: 'new',
            provider: 'youtube' as const,
            metadata: { title: 'New' },
          },
        ],
      ]),
    );
    const repo = mockRepo([embedRow(1, 'abc', 'Cached')]);
    const service = makeService(repo, youtube);

    const items = await service.getYoutubeEmbeds(['abc', 'new']);

    expect(youtube.fetchByIds).toHaveBeenCalledWith(['new']);
    expect(repo.saved).toHaveLength(1);
    expect(items.new.metadata).toEqual({
      title: 'New',
      thumb: '',
      duration: '',
    });
    expect(items.abc.id).toBe(1);
  });

  /** An outage or spent quota must not break rendering of a node with a video. */
  it('still returns the cached subset when the API fails', async () => {
    const youtube = mockYoutube(new Map(), true);
    const service = makeService(
      mockRepo([embedRow(1, 'abc', 'Cached')]),
      youtube,
    );

    const items = await service.getYoutubeEmbeds(['abc', 'broken']);

    expect(items.abc.id).toBe(1);
    expect(items.broken).toBeUndefined();
  });

  it('omits ids that are neither cached nor resolvable', async () => {
    const service = makeService(mockRepo([]), mockYoutube(new Map()));

    await expect(service.getYoutubeEmbeds(['missing'])).resolves.toEqual({});
  });

  /** `(provider, address)` has no unique index, so duplicates are possible. */
  it('keeps the newest row per address when the table holds duplicates', async () => {
    const service = makeService(
      mockRepo([embedRow(1, 'abc', 'First'), embedRow(2, 'abc', 'Second')]),
      mockYoutube(new Map()),
    );

    const items = await service.getYoutubeEmbeds(['abc']);

    expect(items.abc.id).toBe(2);
  });

  it('always answers title, thumb and duration', async () => {
    const service = makeService(
      mockRepo([embedRow(1, 'abc', 'Only title')]),
      mockYoutube(new Map()),
    );

    const items = await service.getYoutubeEmbeds(['abc']);

    expect(items.abc.metadata).toEqual({
      title: 'Only title',
      thumb: '',
      duration: '',
    });
  });

  it('defaults a null metadata blob to empty fields', async () => {
    const row = {
      id: 1,
      address: 'abc',
      provider: 'youtube',
      metadata: null,
    } as Embed;
    const service = makeService(mockRepo([row]), mockYoutube(new Map()));

    const items = await service.getYoutubeEmbeds(['abc']);

    expect(items.abc.metadata).toEqual({ title: '', thumb: '', duration: '' });
  });

  describe('local copies', () => {
    const env = { ...process.env };

    beforeEach(() => {
      process.env.CACHE_EXTERNAL_MEDIA = 'true';
    });

    afterAll(() => {
      process.env = env;
    });

    const tracked = (
      externalId: string,
      fields: Partial<ExternalMedia>,
    ): Partial<ExternalMedia> => ({
      id: externalId.length,
      provider: 'youtube',
      externalId,
      sourceStatus: 'available',
      ...fields,
    });

    it('adds the copy url and source state to a ready video', async () => {
      const service = makeService(
        mockRepo([embedRow(1, 'aaaaaaaaaaa', 'Title')]),
        mockYoutube(new Map()),
        mediaRepos([
          tracked('aaaaaaaaaaa', {
            videoStatus: 'ready',
            sourceStatus: 'gone',
            height: 720,
            videoFileId: 99,
          }),
        ]),
      );

      const items = await service.getYoutubeEmbeds(['aaaaaaaaaaa']);

      expect(items.aaaaaaaaaaa).toMatchObject({
        metadata: { title: 'Title' },
        video: {
          status: 'ready',
          source: 'gone',
          url: 'REMOTE_CURRENT://media/youtube/aaaaaaaaaaa.mp4',
          height: 720,
          size: 95 * 1024 * 1024,
        },
      });
    });

    it('reports download progress', async () => {
      const item = tracked('bbbbbbbbbbb', { videoStatus: 'downloading' });
      const service = makeService(
        mockRepo([]),
        mockYoutube(new Map()),
        mediaRepos([item], [{ mediaId: item.id, progress: 50 }]),
      );

      const items = await service.getYoutubeEmbeds(['bbbbbbbbbbb']);

      expect(items.bbbbbbbbbbb.video).toEqual({
        status: 'downloading',
        source: 'available',
        progress: 50,
      });
    });

    it('lists a tracked video even without a title', async () => {
      const service = makeService(
        mockRepo([]),
        mockYoutube(new Map()),
        mediaRepos([tracked('ccccccccccc', { videoStatus: 'queued' })]),
      );

      const items = await service.getYoutubeEmbeds(['ccccccccccc']);

      expect(items.ccccccccccc).toEqual({
        id: 0,
        provider: 'youtube',
        address: 'ccccccccccc',
        metadata: { title: '', thumb: '', duration: '' },
        video: { status: 'queued', source: 'available' },
      });
    });

    it('leaves out removed copies, and everything while the cache is off', async () => {
      const removed = makeService(
        mockRepo([]),
        mockYoutube(new Map()),
        mediaRepos([tracked('ddddddddddd', { videoStatus: 'removed' })]),
      );
      await expect(removed.getYoutubeEmbeds(['ddddddddddd'])).resolves.toEqual(
        {},
      );

      process.env.CACHE_EXTERNAL_MEDIA = 'false';
      const repos = mediaRepos([
        tracked('eeeeeeeeeee', { videoStatus: 'ready' }),
      ]);
      const off = makeService(mockRepo([]), mockYoutube(new Map()), repos);

      await expect(off.getYoutubeEmbeds(['eeeeeeeeeee'])).resolves.toEqual({});
      expect(repos.media.findBy).not.toHaveBeenCalled();
    });
  });
});
