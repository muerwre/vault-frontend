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
    max_duration_sec: number;
    max_mb: number;
    backlog_batch: number;
    backlog_cron: string;
    rescan_cron: string;
    cleanup_cron: string;
    grace_days: number;
    time_zone: string;
  };
}

/** Filters for the job list. `retrying` is queued jobs that already failed. */
export const MEDIA_ADMIN_JOB_FILTERS = [
  'failed',
  'retrying',
  'running',
  'queued',
  'done',
  'cancelled',
] as const;

export type MediaAdminJobFilter = (typeof MEDIA_ADMIN_JOB_FILTERS)[number];

export interface IMediaAdminJob {
  id: number;
  kind: MediaJobKind;
  status: MediaJobStatus;
  priority: number;
  progress: number;
  attempts: number;
  next_attempt_at: string | null;
  last_error: string | null;
  lease_owner: string | null;
  updated_at: string;
  finished_at: string | null;
  media: {
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
