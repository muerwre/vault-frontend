/**
 * The admin view of the media cache, served under `/api/admin/media` to admins
 * only. Wire casing follows the rest of the site's API.
 */
import type { MediaJobKind, MediaJobStatus } from './status';

export interface IMediaAdminFetcher {
  name: string;
  yt_dlp_version: string;
  last_seen_at: string;
}

export interface IMediaAdminSummary {
  enabled: boolean;
  /** Items by video status (`none`, `queued`, `ready`, …). */
  items: Record<string, number>;
  /** Items by cover status. */
  thumbs: Record<string, number>;
  /** Items from older content not yet released for download. */
  backlog_waiting: number;
  jobs: Array<{ kind: MediaJobKind; status: MediaJobStatus; count: number }>;
  /** Jobs waiting to be retried after a failure. */
  retrying: number;
  storage: { files: number; bytes: number };
  /** Fetchers seen since the backend started. */
  fetchers: IMediaAdminFetcher[];
  settings: {
    /** Fetcher keys configured; the keys themselves are never sent. */
    fetcher_keys: number;
    /** Human-readable `MEDIA_QUALITY_TIERS`. */
    quality_tiers: string;
    max_duration_sec: number;
    max_mb: number;
    backlog_batch: number;
    backlog_cron: string;
    rescan_cron: string;
    cleanup_cron: string;
    grace_days: number;
    /** The zone schedules run in: the backend's own `TZ`. */
    time_zone: string;
  };
}

/**
 * Filters for the job list. `queue` is everything not finished: jobs being
 * fetched, then waiting ones in the order fetchers take them, then those
 * waiting for a retry, then the backlog in the order it is released, then
 * cancelled jobs.
 */
export const MEDIA_ADMIN_JOB_FILTERS = ['queue', 'done', 'failed'] as const;

export type MediaAdminJobFilter = (typeof MEDIA_ADMIN_JOB_FILTERS)[number];

/**
 * A backlog item in the queue has no job yet: its `status` is `backlog` and
 * its `id` is the item's, not a job's.
 */
export const MEDIA_ADMIN_BACKLOG = 'backlog';

export interface IMediaAdminJob {
  id: number;
  kind: MediaJobKind;
  status: MediaJobStatus | typeof MEDIA_ADMIN_BACKLOG;
  priority: number;
  progress: number;
  attempts: number;
  next_attempt_at: string | null;
  last_error: string | null;
  lease_owner: string | null;
  updated_at: string;
  finished_at: string | null;
  media: {
    /** The item's own id, which item actions take. */
    id: number;
    provider: string;
    external_id: string;
    video_status: string;
    skip_reason: string | null;
    duration: number | null;
  } | null;
}

export interface IMediaAdminJobList {
  jobs: IMediaAdminJob[];
  total: number;
}
