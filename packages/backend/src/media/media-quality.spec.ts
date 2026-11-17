import {
  describeMediaQualityTiers,
  heightLimitFor,
  maxKeptDuration,
  parseMediaQualityTiers,
} from '@vault/common/media';

const MIN = 60;

describe('media quality tiers', () => {
  const tiers = parseMediaQualityTiers('30:720,60:480,90:360');

  it('reads minutes:height pairs, shortest first', () => {
    expect(parseMediaQualityTiers('90:360, 30:720 ,60:480')).toEqual([
      { maxDurationSec: 30 * MIN, maxHeight: 720 },
      { maxDurationSec: 60 * MIN, maxHeight: 480 },
      { maxDurationSec: 90 * MIN, maxHeight: 360 },
    ]);
  });

  it.each(['', 'nonsense', '30:abc, -5:720, 0:480'])(
    'falls back to the defaults for %p',
    (value) => {
      expect(parseMediaQualityTiers(value)).toEqual(tiers);
    },
  );

  it.each([
    [10 * MIN, 720],
    [30 * MIN, 720],
    [30 * MIN + 1, 480],
    [60 * MIN, 480],
    [75 * MIN, 360],
    [90 * MIN, 360],
    [90 * MIN + 1, null],
    [5 * 60 * MIN, null],
  ])('keeps a %is video at %p', (duration, height) => {
    expect(heightLimitFor(tiers, duration)).toBe(height);
  });

  it('gives an unknown length the first tier', () => {
    expect(heightLimitFor(tiers, null)).toBe(720);
    expect(heightLimitFor(tiers, 0)).toBe(720);
  });

  it('describes itself and its longest length', () => {
    expect(maxKeptDuration(tiers)).toBe(90 * MIN);
    expect(describeMediaQualityTiers(tiers)).toBe(
      '≤30 min: 720p, ≤60 min: 480p, ≤90 min: 360p',
    );
  });
});
