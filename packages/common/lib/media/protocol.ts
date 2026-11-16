/**
 * The contract between the backend and the media fetcher, served under
 * `/api/internal/media`. Every request carries `Authorization: Bearer <key>`.
 */
import type { MediaProvider } from './providers';
import type { MediaJobKind, MediaSkipReason } from './status';

/** `POST /jobs/claim` */
export interface MediaClaimRequest {
  /** The kinds this worker handles; it gets the most urgent job of those. */
  kinds: MediaJobKind[];
  /** The fetcher's yt-dlp version, for diagnosis. */
  ytDlpVersion?: string;
}

/** Limits a job's output must fit. */
export interface MediaJobConstraints {
  maxDurationSec: number;
  maxBytes: number;
}

/** The answer to a claim; no job is `204 No Content`. */
export interface MediaClaimedJob {
  id: number;
  kind: MediaJobKind;
  provider: MediaProvider;
  externalId: string;
  /** Built by the backend from the id; the fetcher fetches nothing else. */
  url: string;
  constraints: MediaJobConstraints;
  /** 1 on the first try. */
  attempt: number;
  /** The job is lost unless progress is reported before this. */
  leaseUntil: string;
}

export const MEDIA_JOB_STAGES = {
  DOWNLOAD: 'download',
  PROCESS: 'process',
  UPLOAD: 'upload',
} as const;

export type MediaJobStage =
  (typeof MEDIA_JOB_STAGES)[keyof typeof MEDIA_JOB_STAGES];

/** `POST /jobs/:id/progress`; also renews the lease. */
export interface MediaProgressRequest {
  percent: number;
  stage?: MediaJobStage;
}

/** What a job can upload with `PUT /jobs/:id/files/:slot`. */
export const MEDIA_UPLOAD_SLOTS = {
  VIDEO: 'video',
  THUMBNAIL: 'thumbnail',
} as const;

export type MediaUploadSlot =
  (typeof MEDIA_UPLOAD_SLOTS)[keyof typeof MEDIA_UPLOAD_SLOTS];

/** Header carrying the hex SHA-256 of an uploaded body. */
export const MEDIA_SHA256_HEADER = 'x-sha256';

/** `POST /jobs/:id/complete`, after the uploads. */
export interface MediaCompleteRequest {
  video?: { duration?: number; width?: number; height?: number };
}

/** `POST /jobs/:id/fail` */
export interface MediaFailRequest {
  reason: string;
  /** False for failures that cannot change, such as a removed video. */
  retryable: boolean;
}

/** `POST /jobs/:id/skip` */
export interface MediaSkipRequest {
  reason: MediaSkipReason;
  duration?: number;
  estimatedBytes?: number;
}
