const MAX_EMAIL_LENGTH = 255;

/** Emails are stored trimmed and lower-cased. */
export const normalizeEmail = (value: string): string =>
  value.trim().toLowerCase();

/** Deliberately loose: one `@` with something on both sides, no spaces. */
export const isEmail = (value: string): boolean =>
  value.length <= MAX_EMAIL_LENGTH && /^[^\s@]+@[^\s@]+$/.test(value);

/** Compares as stored, so older mixed-case rows still match. */
export const isSameEmail = (
  a: string | null | undefined,
  b: string | null | undefined,
): boolean => normalizeEmail(a ?? '') === normalizeEmail(b ?? '');
