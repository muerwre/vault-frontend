/** What an external item turned out to be. */
export const MEDIA_KINDS = {
  UNKNOWN: 'unknown',
  VIDEO: 'video',
  IMAGE: 'image',
} as const;

export type MediaKind = (typeof MEDIA_KINDS)[keyof typeof MEDIA_KINDS];

/**
 * Lifecycle of an item's local video copy.
 *
 * `none` has not been looked at yet; `skipped` and `unavailable` are final
 * until the limits change or the item is referenced again after `removed`.
 */
export const MEDIA_VIDEO_STATUSES = {
  NONE: 'none',
  QUEUED: 'queued',
  DOWNLOADING: 'downloading',
  READY: 'ready',
  FAILED: 'failed',
  UNAVAILABLE: 'unavailable',
  SKIPPED: 'skipped',
  REMOVED: 'removed',
} as const;

export type MediaVideoStatus =
  (typeof MEDIA_VIDEO_STATUSES)[keyof typeof MEDIA_VIDEO_STATUSES];

/** Why an item's video is not kept locally. */
export const MEDIA_SKIP_REASONS = {
  TOO_LONG: 'too_long',
  TOO_BIG: 'too_big',
  LIVE: 'live',
  NOT_VIDEO: 'not_video',
} as const;

export type MediaSkipReason =
  (typeof MEDIA_SKIP_REASONS)[keyof typeof MEDIA_SKIP_REASONS];

/** Skip reason of a video an admin chose not to keep; never a fetcher's. */
export const MEDIA_MANUAL_SKIP = 'manual';

/** Any reason an item can be skipped for. */
export type MediaItemSkipReason = MediaSkipReason | typeof MEDIA_MANUAL_SKIP;

export const MEDIA_THUMB_STATUSES = {
  NONE: 'none',
  QUEUED: 'queued',
  READY: 'ready',
  FAILED: 'failed',
  UNAVAILABLE: 'unavailable',
} as const;

export type MediaThumbStatus =
  (typeof MEDIA_THUMB_STATUSES)[keyof typeof MEDIA_THUMB_STATUSES];

/** Work the fetcher can be handed. */
export const MEDIA_JOB_KINDS = {
  PROBE: 'probe',
  DOWNLOAD: 'download',
  THUMBNAIL: 'thumbnail',
  TRANSCODE: 'transcode',
} as const;

export type MediaJobKind =
  (typeof MEDIA_JOB_KINDS)[keyof typeof MEDIA_JOB_KINDS];

export const MEDIA_JOB_STATUSES = {
  QUEUED: 'queued',
  RUNNING: 'running',
  DONE: 'done',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export type MediaJobStatus =
  (typeof MEDIA_JOB_STATUSES)[keyof typeof MEDIA_JOB_STATUSES];

/** Lower runs first. */
export const MEDIA_PRIORITIES = {
  /** Content posted while the service is running. */
  FRESH: 0,
  /** Content found by scanning what was posted before. */
  BACKFILL: 10,
  /** Bulk maintenance, such as re-encoding old uploads. */
  MAINTENANCE: 20,
} as const;

/** What references an item. */
export const MEDIA_OWNER_TYPES = {
  NODE: 'node',
  COMMENT: 'comment',
} as const;

export type MediaOwnerType =
  (typeof MEDIA_OWNER_TYPES)[keyof typeof MEDIA_OWNER_TYPES];

/**
 * Whether the original can still be played from the provider. `gone` covers
 * removed, private and embedding-disabled items alike: in each case the local
 * copy is what can be shown.
 */
export const MEDIA_SOURCE_STATUSES = {
  UNKNOWN: 'unknown',
  AVAILABLE: 'available',
  GONE: 'gone',
} as const;

export type MediaSourceStatus =
  (typeof MEDIA_SOURCE_STATUSES)[keyof typeof MEDIA_SOURCE_STATUSES];
