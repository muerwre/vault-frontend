import {
  decideVideo,
  diffIds,
  refsFromBlocks,
  refsFromText,
  retryDelayMs,
} from './media.rules';

const A = 'aaaaaaaaaaa';
const B = 'bbbbbbbbbbb';

describe('media rules', () => {
  describe('refsFromBlocks', () => {
    it('reads video blocks only, once per item', () => {
      expect(
        refsFromBlocks([
          { type: 'video', url: `https://youtu.be/${A}` },
          { type: 'text', text: `https://youtu.be/${B}` },
          { type: 'video', url: `https://www.youtube.com/watch?v=${A}` },
          { type: 'video', url: 'https://vimeo.com/1' },
        ]),
      ).toEqual([{ provider: 'youtube', id: A }]);
    });

    it('tolerates missing blocks', () => {
      expect(refsFromBlocks(null)).toEqual([]);
      expect(refsFromBlocks(undefined)).toEqual([]);
    });
  });

  describe('refsFromText', () => {
    it('finds links anywhere in the text', () => {
      expect(
        refsFromText(`see https://youtu.be/${A} and youtu.be/${B}`),
      ).toEqual([
        { provider: 'youtube', id: A },
        { provider: 'youtube', id: B },
      ]);
    });

    it('tolerates null', () => {
      expect(refsFromText(null)).toEqual([]);
    });
  });

  describe('diffIds', () => {
    it('adds the new and drops the gone', () => {
      expect(diffIds([1, 2, 3], [2, 3, 4])).toEqual({
        added: [4],
        removed: [1],
      });
    });

    it('ignores duplicates', () => {
      expect(diffIds([1, 1], [1, 1, 2, 2])).toEqual({
        added: [2],
        removed: [],
      });
    });
  });

  describe('decideVideo', () => {
    const limits = { maxDurationSec: 1800 };

    it('marks an item the provider does not know as unavailable', () => {
      expect(decideVideo(undefined, limits)).toEqual({ status: 'unavailable' });
    });

    it('skips live streams', () => {
      expect(decideVideo({ duration: null, isLive: true }, limits)).toEqual({
        status: 'skipped',
        reason: 'live',
      });
    });

    it('skips videos over the limit', () => {
      expect(decideVideo({ duration: 1801, isLive: false }, limits)).toEqual({
        status: 'skipped',
        reason: 'too_long',
      });
    });

    it('queues videos at the limit', () => {
      expect(decideVideo({ duration: 1800, isLive: false }, limits)).toEqual({
        status: 'queued',
      });
    });

    it('queues videos of unknown length, for the fetcher to check', () => {
      expect(decideVideo({ duration: null, isLive: false }, limits)).toEqual({
        status: 'queued',
      });
    });
  });

  describe('retryDelayMs', () => {
    const hour = 60 * 60 * 1000;

    it.each([
      [1, hour],
      [2, 24 * hour],
      [3, 7 * 24 * hour],
      [10, 7 * 24 * hour],
    ])('waits after failure %i for %i ms', (failures, delay) => {
      expect(retryDelayMs(failures)).toBe(delay);
    });
  });
});
