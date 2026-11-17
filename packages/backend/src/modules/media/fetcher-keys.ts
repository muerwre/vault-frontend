import { createHash, timingSafeEqual } from 'crypto';

export interface FetcherKey {
  name: string;
  secret: string;
}

/**
 * Parses `name:secret,name:secret`. Entries without both halves are dropped;
 * a secret may itself contain `:`.
 */
export const parseFetcherKeys = (value: string): FetcherKey[] =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .flatMap((entry) => {
      const separator = entry.indexOf(':');
      const name = entry.slice(0, separator).trim();
      const secret = entry.slice(separator + 1).trim();

      return separator > 0 && name && secret ? [{ name, secret }] : [];
    });

const digest = (value: string): Buffer =>
  createHash('sha256').update(value).digest();

/**
 * The name of the fetcher whose secret `presented` is, or null. Every key is
 * compared in constant time, so timing reveals neither a match nor its length.
 */
export const matchFetcherKey = (
  keys: FetcherKey[],
  presented: string,
): string | null => {
  const wanted = digest(presented ?? '');
  let match: string | null = null;

  for (const key of keys) {
    if (timingSafeEqual(digest(key.secret), wanted) && match === null) {
      match = key.name;
    }
  }

  return presented ? match : null;
};

/** The secret in an `Authorization: Bearer <secret>` header, or ''. */
export const bearerSecret = (header: string | undefined): string => {
  const match = /^Bearer\s+(.+)$/i.exec(header ?? '');

  return match ? match[1].trim() : '';
};
