/**
 * Quality by length: the longer a video, the lower the height it is kept at,
 * and past the last tier it is not kept at all.
 */
export interface MediaQualityTier {
  /** Videos up to this long fall in the tier. */
  maxDurationSec: number;
  /** Highest height kept for them. */
  maxHeight: number;
}

export const DEFAULT_MEDIA_QUALITY_TIERS = '30:720,60:480,90:360';

/**
 * Reads `minutes:height` pairs, e.g. `30:720,60:480,90:360`, shortest first.
 * Malformed entries are dropped; nothing usable gives the defaults.
 */
export const parseMediaQualityTiers = (value: string): MediaQualityTier[] => {
  const read = (text: string) =>
    text
      .split(',')
      .map((entry) => entry.trim().split(':').map(Number))
      .filter(
        ([minutes, height]) =>
          Number.isFinite(minutes) &&
          minutes > 0 &&
          Number.isFinite(height) &&
          height > 0,
      )
      .map(([minutes, height]) => ({
        maxDurationSec: Math.round(minutes * 60),
        maxHeight: Math.round(height),
      }))
      .sort((a, b) => a.maxDurationSec - b.maxDurationSec);

  const tiers = read(value ?? '');

  return tiers.length > 0 ? tiers : read(DEFAULT_MEDIA_QUALITY_TIERS);
};

/**
 * Highest height a video of `durationSec` is kept at, or null when it is too
 * long for every tier. An unknown length gets the first tier's height; the
 * size cap still applies.
 */
export const heightLimitFor = (
  tiers: MediaQualityTier[],
  durationSec: number | null | undefined,
): number | null => {
  if (!durationSec) {
    return tiers[0]?.maxHeight ?? null;
  }

  return (
    tiers.find((tier) => durationSec <= tier.maxDurationSec)?.maxHeight ?? null
  );
};

/** The longest a video can be and still be kept. */
export const maxKeptDuration = (tiers: MediaQualityTier[]): number =>
  tiers.reduce((longest, tier) => Math.max(longest, tier.maxDurationSec), 0);

/** `30:720,60:480` → `≤30 min: 720p, ≤60 min: 480p`. */
export const describeMediaQualityTiers = (tiers: MediaQualityTier[]): string =>
  tiers
    .map(
      (tier) =>
        `≤${Math.round(tier.maxDurationSec / 60)} min: ${tier.maxHeight}p`,
    )
    .join(', ');
