/** Readers for environment values. */

/** A whole number above zero, or `fallback`. */
export const positiveInt = (
  value: string | undefined,
  fallback: number,
): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/** A whole number of zero or more, or `fallback`. */
export const nonNegativeInt = (
  value: string | undefined,
  fallback: number,
): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

/** `720,480,360`; anything unparseable falls back to the default ladder. */
export const parseLadder = (value: string | undefined): number[] => {
  const heights = (value ?? '')
    .split(',')
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((height) => Number.isFinite(height) && height > 0);

  return heights.length > 0
    ? [...new Set(heights)].sort((a, b) => b - a)
    : [720, 480, 360];
};
