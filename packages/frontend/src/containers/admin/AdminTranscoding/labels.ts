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
  failed: 'Ошибки',
  retrying: 'Повтор',
  running: 'В работе',
  queued: 'Очередь',
  done: 'Готово',
  cancelled: 'Отменены',
};

export const SKIP_REASON_LABELS: Record<string, string> = {
  too_long: 'слишком длинное',
  too_big: 'слишком большое',
  live: 'трансляция',
  not_video: 'не видео',
};

/** Jobs that can be sent back to the queue from the list. */
export const RETRYABLE_FILTERS: MediaJobFilter[] = [
  'failed',
  'retrying',
  'cancelled',
  'done',
];
