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
};

/**
 * Badge for a job's state, or none for one simply waiting its turn (or a
 * failed one: its error says enough).
 */
export const jobBadge = (job: {
  status: string;
  attempts: number;
  progress: number;
}): { label: string; tone: 'active' | 'muted' | 'done' } | null => {
  switch (job.status) {
    case 'running':
      return { label: `В работе · ${job.progress}%`, tone: 'active' };
    case 'queued':
      return job.attempts > 0 ? { label: 'Повтор', tone: 'muted' } : null;
    case 'cancelled':
      return { label: 'Отменено', tone: 'muted' };
    case 'done':
      return { label: 'Готово', tone: 'done' };
    default:
      return null;
  }
};

/**
 * Whether a job can be sent back to the front of the queue. Finished and
 * running ones cannot, nor one simply waiting its turn.
 */
export const canRetryJob = (job: { status: string; attempts: number }) =>
  job.status === 'failed' ||
  job.status === 'cancelled' ||
  (job.status === 'queued' && job.attempts > 0);
