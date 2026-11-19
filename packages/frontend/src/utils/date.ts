export const sortCreatedAtAsc = (a, b) =>
  new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

export const sortCreatedAtDesc = (a, b) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

/** `125` → `2:05`; `3725` → `1:02:05`. */
export const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, '0');

  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};
