/**
 * External media providers. Everything that knows a provider's URL shapes lives
 * here, so the backend (reference tracking, the fetcher's canonical URLs) and
 * the frontend (rendering) agree on which ids a piece of text contains.
 *
 * Plain regexes rather than `URL`: this module runs in the browser and in Node,
 * and has to accept scheme-less links as people paste them.
 */

export const MEDIA_PROVIDERS = {
  YOUTUBE: 'youtube',
} as const;

export type MediaProvider =
  (typeof MEDIA_PROVIDERS)[keyof typeof MEDIA_PROVIDERS];

/** An external item, identified the same way everywhere. */
export interface MediaRef {
  provider: MediaProvider;
  id: string;
}

export interface MediaProviderDef {
  name: MediaProvider;
  /**
   * Finds candidate URLs of this provider in free text. Global; matches are
   * checked with {@link MediaProviderDef.parseUrl} afterwards.
   */
  urlInText: RegExp;
  /**
   * Substrings every link of this provider contains, for a cheap pre-filter
   * (such as SQL `LIKE`) before {@link MediaProviderDef.urlInText} runs.
   */
  textHints: readonly string[];
  /** The item id a single URL points at, or null when it points at none. */
  parseUrl(url: string): string | null;
  isValidId(id: string): boolean;
  /** The only URL ever used to fetch an item, built from its id. */
  canonicalUrl(id: string): string;
  /** URL for an embedded player, or null when the provider has none. */
  embedUrl(id: string): string | null;
}

const YOUTUBE_ID = /^[\w-]{11}$/;

/** `youtu.be/<id>` */
const YOUTUBE_SHORT_LINK =
  /^(?:https?:\/\/)?(?:www\.)?youtu\.be\/([\w-]{11})(?![\w-])/i;

/** Any `youtube.com` host, `www.`, `m.`, `music.` and the no-cookie domain included. */
const YOUTUBE_HOST =
  /^(?:https?:\/\/)?(?:[\w-]+\.)?youtube(?:-nocookie)?\.com(?=[/?#]|$)/i;

/** `/embed/<id>`, `/shorts/<id>` and the other path forms. */
const YOUTUBE_PATH_ID = /^\/(?:embed|v|e|shorts|live)\/([\w-]{11})(?![\w-])/i;

/** `v=<id>` anywhere in the query, `&amp;`-escaped separators included. */
const YOUTUBE_QUERY_ID = /[?&;]v=([\w-]{11})(?![\w-])/;

const parseYoutubeUrl = (url: string): string | null => {
  const value = (url ?? '').trim();

  const short = YOUTUBE_SHORT_LINK.exec(value);

  if (short) {
    return short[1];
  }

  const host = YOUTUBE_HOST.exec(value);

  if (!host) {
    return null;
  }

  const rest = value.slice(host[0].length);

  return (
    (YOUTUBE_PATH_ID.exec(rest) ?? YOUTUBE_QUERY_ID.exec(rest))?.[1] ?? null
  );
};

export const YOUTUBE_PROVIDER: MediaProviderDef = {
  name: MEDIA_PROVIDERS.YOUTUBE,
  urlInText:
    /(?:https?:\/\/)?(?:[\w-]+\.)?(?:youtube(?:-nocookie)?\.com|youtu\.be)\/[^\s<>"'`]+/gi,
  textHints: ['youtu'],
  parseUrl: parseYoutubeUrl,
  isValidId: (id) => YOUTUBE_ID.test(id ?? ''),
  canonicalUrl: (id) => `https://www.youtube.com/watch?v=${id}`,
  embedUrl: (id) => `https://www.youtube.com/embed/${id}`,
};

export const MEDIA_PROVIDER_DEFS: Readonly<
  Record<MediaProvider, MediaProviderDef>
> = {
  [MEDIA_PROVIDERS.YOUTUBE]: YOUTUBE_PROVIDER,
};

export const isMediaProvider = (name: string): name is MediaProvider =>
  Object.prototype.hasOwnProperty.call(MEDIA_PROVIDER_DEFS, name);

/** The item a single URL points at, trying every provider. */
export const parseMediaUrl = (url: string): MediaRef | null => {
  for (const def of Object.values(MEDIA_PROVIDER_DEFS)) {
    const id = def.parseUrl(url);

    if (id) {
      return { provider: def.name, id };
    }
  }

  return null;
};

/** Every item linked from `text`, de-duplicated, in order of first appearance. */
export const extractMediaRefs = (text: string): MediaRef[] => {
  const found = new Map<string, MediaRef>();

  for (const def of Object.values(MEDIA_PROVIDER_DEFS)) {
    for (const match of (text ?? '').matchAll(def.urlInText)) {
      const id = def.parseUrl(match[0]);

      if (id && !found.has(mediaRefKey({ provider: def.name, id }))) {
        found.set(mediaRefKey({ provider: def.name, id }), {
          provider: def.name,
          id,
        });
      }
    }
  }

  return [...found.values()];
};

/** `provider:id`, the form used as a map key and in query strings. */
export const mediaRefKey = ({ provider, id }: MediaRef): string =>
  `${provider}:${id}`;

/** Inverse of {@link mediaRefKey}; null for an unknown provider or bad id. */
export const parseMediaRefKey = (key: string): MediaRef | null => {
  const separator = (key ?? '').indexOf(':');

  if (separator < 1) {
    return null;
  }

  const provider = key.slice(0, separator);
  const id = key.slice(separator + 1);

  if (
    !isMediaProvider(provider) ||
    !MEDIA_PROVIDER_DEFS[provider].isValidId(id)
  ) {
    return null;
  }

  return { provider, id };
};
