import type { Repository } from 'typeorm';

import type { ExternalMedia } from '../../entities/media.entity';
import { youtubeFetch } from '../../globals/youtube-fetch';

import {
  MediaSourceService,
  sourceStatusFromOembed,
} from './media-source.service';

jest.mock('../../globals/youtube-fetch', () => ({ youtubeFetch: jest.fn() }));

const fetchMock = youtubeFetch as jest.MockedFunction<typeof youtubeFetch>;

const answer = (status: number) =>
  ({
    status,
    body: { cancel: async (): Promise<void> => undefined },
  }) as unknown as Response;

describe('sourceStatusFromOembed', () => {
  it.each([
    [200, 'available'],
    [401, 'gone'],
    [403, 'gone'],
    [404, 'gone'],
    [429, null],
    [500, null],
    [503, null],
  ])('reads %i as %p', (status, expected) => {
    expect(sourceStatusFromOembed(status)).toBe(expected);
  });
});

describe('MediaSourceService.checkDue', () => {
  const due = ['aaaaaaaaaaa', 'bbbbbbbbbbb', 'ccccccccccc'].map(
    (externalId, index) =>
      ({ id: index + 1, externalId, sourceStatus: 'unknown' }) as ExternalMedia,
  );

  const setup = () => {
    const builder: Record<string, unknown> = {};
    for (const method of [
      'where',
      'andWhere',
      'setParameters',
      'orderBy',
      'take',
    ]) {
      builder[method] = () => builder;
    }
    builder.getMany = async () => due;

    const media = {
      createQueryBuilder: () => builder,
      update: jest.fn(async (..._args: unknown[]): Promise<void> => undefined),
    } as unknown as Repository<ExternalMedia> & { update: jest.Mock };

    return { service: new MediaSourceService(media), media };
  };

  beforeEach(() => {
    fetchMock.mockReset();
    jest.spyOn(global, 'setTimeout').mockImplementation(((fn: () => void) => {
      fn();
      return { unref: (): void => undefined };
    }) as unknown as typeof setTimeout);
  });

  afterEach(() => jest.restoreAllMocks());

  it('records what each check says', async () => {
    fetchMock
      .mockResolvedValueOnce(answer(200))
      .mockResolvedValueOnce(answer(404))
      .mockResolvedValueOnce(answer(200));
    const { service, media } = setup();

    await expect(service.checkDue()).resolves.toBe(3);

    expect(
      media.update.mock.calls.map(([, fields]) => fields.sourceStatus),
    ).toEqual(['available', 'gone', 'available']);
  });

  it('stops at the first 429, leaving the rest for the next run', async () => {
    fetchMock.mockResolvedValueOnce(answer(200)).mockResolvedValue(answer(429));
    const { service, media } = setup();

    await service.checkDue();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(media.update).toHaveBeenCalledTimes(1);
  });

  it('pauses after a check that said nothing', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));
    const { service } = setup();

    await service.checkDue();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(setTimeout).toHaveBeenCalledTimes(3);
  });
});
