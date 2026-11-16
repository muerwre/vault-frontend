/** `/admin/media` wire shapes; the backend's are in `@vault/common/media`. */

export interface ApiMediaFetcher {
  name: string;
  yt_dlp_version: string;
  last_seen_at: string;
}

export interface ApiMediaSummary {
  enabled: boolean;
  items: Record<string, number>;
  thumbs: Record<string, number>;
  backlog_waiting: number;
  jobs: Array<{ kind: string; status: string; count: number }>;
  retrying: number;
  storage: { files: number; bytes: number };
  fetchers: ApiMediaFetcher[];
  settings: {
    fetcher_keys: number;
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

export const MEDIA_JOB_FILTERS = [
  'failed',
  'retrying',
  'running',
  'queued',
  'done',
  'cancelled',
] as const;

export type MediaJobFilter = (typeof MEDIA_JOB_FILTERS)[number];

export interface ApiMediaJob {
  id: number;
  kind: string;
  status: string;
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

export interface ApiMediaJobList {
  jobs: ApiMediaJob[];
  total: number;
}
