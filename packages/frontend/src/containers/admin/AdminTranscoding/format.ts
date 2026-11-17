const UNITS = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];

/** `1536` → `1.5 КБ`. */
export const formatBytes = (bytes: number): string => {
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${unit === 0 ? value : value.toFixed(1)} ${UNITS[unit]}`;
};

/** `125` → `2:05`; `3725` → `1:02:05`. */
export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, '0');

  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

/** A moment relative to `now`: `5 мин назад`, `через 2 ч`. */
export const formatRelative = (iso: string, now = Date.now()): string => {
  const diff = new Date(iso).getTime() - now;
  const minutes = Math.round(Math.abs(diff) / 60_000);

  const amount =
    minutes < 1
      ? 'меньше минуты'
      : minutes < 60
        ? `${minutes} мин`
        : minutes < 48 * 60
          ? `${Math.round(minutes / 60)} ч`
          : `${Math.round(minutes / (24 * 60))} дн`;

  return diff < 0 ? `${amount} назад` : `через ${amount}`;
};

/**
 * Seen this recently, a fetcher counts as connected. Idle ones ask for work
 * every 30 minutes, so this is one poll plus some slack.
 */
export const FETCHER_ONLINE_MS = 35 * 60 * 1000;
