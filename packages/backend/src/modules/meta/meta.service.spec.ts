import type { Repository } from 'typeorm';

import type { Embed } from '../../entities/embed.entity';

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

describe('MetaService', () => {
  it('returns an empty map for no ids without touching the API', async () => {
    const youtube = mockYoutube(new Map());
    const service = new MetaService(mockRepo([]), youtube);

    await expect(service.getYoutubeEmbeds([])).resolves.toEqual({});
    expect(youtube.fetchByIds).not.toHaveBeenCalled();
  });

  it('ignores blank ids', async () => {
    const youtube = mockYoutube(new Map());
    const service = new MetaService(mockRepo([]), youtube);

    await expect(service.getYoutubeEmbeds(['', '  '])).resolves.toEqual({});
    expect(youtube.fetchByIds).not.toHaveBeenCalled();
  });

  it('serves cached embeds without calling the API', async () => {
    const youtube = mockYoutube(new Map());
    const service = new MetaService(
      mockRepo([embedRow(1, 'abc', 'Cached')]),
      youtube,
    );

    const items = await service.getYoutubeEmbeds(['abc']);

    expect(items.abc).toEqual({
      id: 1,
      provider: 'youtube',
      address: 'abc',
      metadata: { title: 'Cached' },
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
    const service = new MetaService(repo, youtube);

    const items = await service.getYoutubeEmbeds(['abc', 'new']);

    expect(youtube.fetchByIds).toHaveBeenCalledWith(['new']);
    expect(repo.saved).toHaveLength(1);
    expect(items.new.metadata).toEqual({ title: 'New' });
    expect(items.abc.id).toBe(1);
  });

  /** An outage or spent quota must not break rendering of a node with a video. */
  it('still returns the cached subset when the API fails', async () => {
    const youtube = mockYoutube(new Map(), true);
    const service = new MetaService(
      mockRepo([embedRow(1, 'abc', 'Cached')]),
      youtube,
    );

    const items = await service.getYoutubeEmbeds(['abc', 'broken']);

    expect(items.abc.id).toBe(1);
    expect(items.broken).toBeUndefined();
  });

  it('omits ids that are neither cached nor resolvable', async () => {
    const service = new MetaService(mockRepo([]), mockYoutube(new Map()));

    await expect(service.getYoutubeEmbeds(['missing'])).resolves.toEqual({});
  });

  /** `(provider, address)` has no unique index, so duplicates are possible. */
  it('keeps the first row per address when the table holds duplicates', async () => {
    const service = new MetaService(
      mockRepo([embedRow(1, 'abc', 'First'), embedRow(2, 'abc', 'Second')]),
      mockYoutube(new Map()),
    );

    const items = await service.getYoutubeEmbeds(['abc']);

    expect(items.abc.id).toBe(1);
  });

  it('defaults a null metadata blob to an empty object', async () => {
    const row = {
      id: 1,
      address: 'abc',
      provider: 'youtube',
      metadata: null,
    } as Embed;
    const service = new MetaService(mockRepo([row]), mockYoutube(new Map()));

    const items = await service.getYoutubeEmbeds(['abc']);

    expect(items.abc.metadata).toEqual({});
  });
});
