import { basename, extname, join, normalize, resolve, sep } from 'path';

import {
  AUDIO_MIMES,
  FILE_TYPES,
  IMAGE_MIMES,
  type FileType,
  type UploadTarget,
  UPLOAD_TARGETS,
} from '@vault/common/constants';

/**
 * Storage layout for uploads. Every historical URL depends on these shapes, so
 * they are pure functions with their own specs.
 */

export interface GeneratedName {
  /** Stored `file.name` — the on-disk filename. */
  name: string;
  /** Stored `file.path` — directory relative to the uploads root. */
  path: string;
  /** Stored `file.full_path` — `path/name`, still relative. */
  fullPath: string;
  /** Stored `file.url`, resolved against the static host by clients. */
  url: string;
}

/** Prefix on stored URLs, expanded by clients against the static host. */
const URL_PREFIX = 'REMOTE_CURRENT://';

/**
 * `uploads/<year>/<month>/<type>/<base>-<unixSeconds><ext>`.
 *
 * The month is **not** zero-padded, the timestamp is in **seconds**, and a name
 * with no extension simply gets none. All three match the existing rows.
 */
export const generateUploadName = (
  originalName: string,
  fileType: FileType,
  now: Date = new Date(),
): GeneratedName => {
  const path = join(
    'uploads',
    String(now.getFullYear()),
    String(now.getMonth() + 1),
    fileType,
  );

  // Strip any directory component a client may have sent.
  const safe = basename(normalize(originalName || 'file'));
  const ext = extname(safe);
  const base = ext ? safe.slice(0, -ext.length) : safe;
  const stamp = Math.floor(now.getTime() / 1000);

  const name = `${base}-${stamp}${ext}`;

  return {
    name,
    path,
    fullPath: `${path}/${name}`,
    url: `${URL_PREFIX}${path}/${name}`,
  };
};

const MIMES_BY_TYPE: Record<string, readonly string[]> = {
  [FILE_TYPES.IMAGE]: IMAGE_MIMES,
  [FILE_TYPES.AUDIO]: AUDIO_MIMES,
};

/** Only `image` and `audio` can be uploaded, and the mime must match. */
export const isUploadTypeAllowed = (type: string): type is FileType =>
  type === FILE_TYPES.IMAGE || type === FILE_TYPES.AUDIO;

export const isMimeAllowedForType = (type: string, mime: string): boolean =>
  (MIMES_BY_TYPE[type] ?? []).includes(mime);

export const isUploadTargetAllowed = (target: string): target is UploadTarget =>
  (Object.values(UPLOAD_TARGETS) as string[]).includes(target);

/** SVG is stored and served as-is; every other image type is rasterised. */
export const needsScaling = (mime: string): boolean => mime !== 'image/svg+xml';

/**
 * Resolves a request path under the uploads root, refusing anything that escapes
 * it. Returns null rather than throwing so callers answer 404.
 */
export const resolveUploadPath = (
  root: string,
  relative: string,
): string | null => {
  if (!root) {
    return null;
  }

  const rootResolved = resolve(root);
  const target = resolve(
    rootResolved,
    normalize(relative).replace(/^([/\\])+/, ''),
  );

  if (target !== rootResolved && !target.startsWith(rootResolved + sep)) {
    return null;
  }

  return target;
};

/** Cached variants live at `cache/<preset>/<src>` under the uploads root. */
export const cachePathFor = (preset: string, src: string): string =>
  join('cache', preset, src);

/** Parses `cache/<preset>/<src>`; returns null for a plain static path. */
export const parseCacheRequest = (
  relative: string,
): { preset: string; src: string } | null => {
  const match = /^\/?cache\/([^/]+)\/(.+)$/.exec(relative);

  if (!match) {
    return null;
  }

  return {
    preset: decodeURIComponent(match[1]),
    src: decodeURIComponent(match[2]),
  };
};
