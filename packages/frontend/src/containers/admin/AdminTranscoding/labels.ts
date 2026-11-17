import { MediaJobFilter } from '~/api/admin/types';

export const VIDEO_STATUS_LABELS: Record<string, string> = {
  none: 'Ждут проверки',
  queued: 'В очереди',
  downloading: 'Скачиваются',
  ready: 'Сохранены',
  failed: 'Ошибка, будет повтор',
  unavailable: 'Недоступны',
  skipped: 'Пропущены',
  removed: 'Удалены',
};

export const JOB_FILTER_LABELS: Record<MediaJobFilter, string> = {
  queue: 'Очередь',
  done: 'Готово',
  failed: 'Ошибки',
};

export const SKIP_REASON_LABELS: Record<string, string> = {
  too_long: 'слишком длинное',
  too_big: 'слишком большое',
  live: 'трансляция',
  not_video: 'не видео',
  manual: 'вручную',
};

/**
 * Badge for a job's state, or none for one simply waiting its turn (or a
 * failed one: its error says enough).
 */
export const jobBadge = (job: {
  status: string;
  attempts: number;
  progress: number;
  media: { video_status: string; skip_reason: string | null } | null;
}): { label: string; tone: 'active' | 'muted' | 'done' } | null => {
  switch (job.status) {
    case 'running':
      return { label: `В работе · ${job.progress}%`, tone: 'active' };
    case 'queued':
      return job.attempts > 0 ? { label: 'Будет повтор', tone: 'muted' } : null;
    case 'backlog':
      return { label: 'Бэклог', tone: 'muted' };
    case 'cancelled':
      return { label: 'Отменено', tone: 'muted' };
    case 'done':
      return job.media?.video_status === 'skipped'
        ? {
            label: `Пропущено${
              job.media.skip_reason
                ? `: ${
                    SKIP_REASON_LABELS[job.media.skip_reason] ??
                    job.media.skip_reason
                  }`
                : ''
            }`,
            tone: 'muted',
          }
        : { label: 'Готово', tone: 'done' };
    default:
      return null;
  }
};

/** Jobs and backlog items share the list but not their ids. */
export const jobKey = (job: { id: number; status: string }) =>
  `${job.status === 'backlog' ? 'item' : 'job'}:${job.id}`;

export type JobAction = 'retry' | 'batch' | 'release' | 'skip' | 'unskip';

export const JOB_ACTION_LABELS: Record<JobAction, string> = {
  retry: 'Повторить',
  batch: 'В батч',
  release: 'В батч',
  skip: 'Пропустить',
  unskip: 'Вернуть',
};

/**
 * What can be done to a list entry. `batch` makes a job waiting for a retry
 * due now, `release` takes a backlog item into the queue now, `unskip` queues
 * a skipped video again. Nothing touches a job a fetcher is working on, or
 * one finished with its copy.
 */
export const jobActions = (job: {
  status: string;
  attempts: number;
  media: { video_status: string } | null;
}): JobAction[] => {
  switch (job.status) {
    case 'failed':
      return ['retry'];
    case 'cancelled':
      return ['retry', 'skip'];
    case 'queued':
      return job.attempts > 0 ? ['batch', 'skip'] : ['skip'];
    case 'backlog':
      return ['release', 'skip'];
    case 'done':
      return job.media?.video_status === 'skipped' ? ['unskip'] : [];
    default:
      return [];
  }
};
