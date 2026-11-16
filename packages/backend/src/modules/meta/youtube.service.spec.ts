import { youtubeFetch } from '../../globals/youtube-fetch';

import { parseIsoDuration, YoutubeService } from './youtube.service';

jest.mock('../../globals/youtube-fetch', () => ({ youtubeFetch: jest.fn() }));

const fetchMock = youtubeFetch as jest.MockedFunction<typeof youtubeFetch>;

const respond = (items: unknown[]) =>
  ({ ok: true, json: async () => ({ items }) }) as unknown as Response;

const idsOf = (call: unknown[]) =>
  (new URL(String(call[0])).searchParams.get('id') ?? '').split(',');

describe('YoutubeService', () => {
  const originalKey = process.env.GOOGLE_API_KEY;

  beforeEach(() => {
    fetchMock.mockReset();
    process.env.GOOGLE_API_KEY = 'spec-key';
  });

  afterAll(() => {
    process.env.GOOGLE_API_KEY = originalKey;
  });

  describe('parseIsoDuration', () => {
    it.each([
      ['PT4M13S', 253],
      ['PT1H', 3600],
      ['PT1H2M3S', 3723],
      ['P1DT2H', 93600],
      ['P1W', 604800],
      ['PT59.6S', 60],
    ])('reads %s as %i seconds', (value, seconds) => {
      expect(parseIsoDuration(value)).toBe(seconds);
    });

    it.each(['', 'P0D', 'PT0S', 'P', 'PT', '4:13', 'garbage'])(
      'reads %s as unknown',
      (value) => {
        expect(parseIsoDuration(value)).toBeNull();
      },
    );
  });

  describe('fetchDetails', () => {
    it('maps title, duration and live state, leaving unknown ids out', async () => {
      fetchMock.mockResolvedValueOnce(
        respond([
          {
            id: 'aaaaaaaaaaa',
            snippet: { title: 'A', liveBroadcastContent: 'none' },
            contentDetails: { duration: 'PT2M' },
          },
          {
            id: 'bbbbbbbbbbb',
            snippet: { title: 'B', liveBroadcastContent: 'live' },
            contentDetails: { duration: 'P0D' },
          },
        ]),
      );

      const details = await new YoutubeService().fetchDetails([
        'aaaaaaaaaaa',
        'bbbbbbbbbbb',
        'ccccccccccc',
      ]);

      expect(details.get('aaaaaaaaaaa')).toEqual({
        title: 'A',
        duration: 120,
        isLive: false,
      });
      expect(details.get('bbbbbbbbbbb')).toEqual({
        title: 'B',
        duration: null,
        isLive: true,
      });
      expect(details.has('ccccccccccc')).toBe(false);

      const url = new URL(String(fetchMock.mock.calls[0][0]));
      expect(url.searchParams.get('part')).toBe('snippet,contentDetails');
    });

    it('asks for at most 50 ids per request', async () => {
      fetchMock.mockResolvedValue(respond([]));
      const ids = Array.from({ length: 120 }, (_, index) =>
        String(index).padStart(11, 'x'),
      );

      await new YoutubeService().fetchDetails(ids);

      expect(fetchMock.mock.calls.map((call) => idsOf(call).length)).toEqual([
        50, 50, 20,
      ]);
    });

    it('throws rather than reporting everything as missing', async () => {
      process.env.GOOGLE_API_KEY = '';
      await expect(
        new YoutubeService().fetchDetails(['aaaaaaaaaaa']),
      ).rejects.toThrow('GOOGLE_API_KEY');

      process.env.GOOGLE_API_KEY = 'spec-key';
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: { message: 'quota' } }),
      } as unknown as Response);
      await expect(
        new YoutubeService().fetchDetails(['aaaaaaaaaaa']),
      ).rejects.toThrow('quota');
    });
  });
});
