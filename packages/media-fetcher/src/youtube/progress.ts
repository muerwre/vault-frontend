/** Marker the `--progress-template` puts before each progress line. */
export const PROGRESS_MARKER = '[vault-progress]';

/**
 * `--progress-template` value producing lines {@link parseProgressDetail}
 * reads: percentage, speed and time left, separated by `|`.
 */
export const PROGRESS_TEMPLATE = `download:${PROGRESS_MARKER} %(progress._percent_str)s|%(progress._speed_str)s|%(progress._eta_str)s`;

export interface ProgressDetail {
  percent: number;
  /** As yt-dlp prints it, e.g. `2.31MiB/s`; empty when unknown. */
  speed: string;
  /** As yt-dlp prints it, e.g. `00:12`; empty when unknown. */
  eta: string;
}

/** yt-dlp's placeholder for a value it does not know yet. */
const unknown = (value: string) =>
  !value || /^(N\/A|Unknown|-+)/i.test(value) ? '' : value;

/** The progress on one line of yt-dlp output, or null. */
export const parseProgressDetail = (line: string): ProgressDetail | null => {
  const index = line.indexOf(PROGRESS_MARKER);

  if (index < 0) {
    return null;
  }

  const [percentPart = '', speed = '', eta = ''] = line
    .slice(index + PROGRESS_MARKER.length)
    .split('|')
    .map((part) => part.trim());

  const match = /([\d.]+)\s*%/.exec(percentPart);
  const value = match ? Number(match[1]) : NaN;

  if (!Number.isFinite(value)) {
    return null;
  }

  return {
    percent: Math.min(100, Math.max(0, value)),
    speed: unknown(speed),
    eta: unknown(eta),
  };
};

/** The percentage on one line of yt-dlp output, or null. */
export const parseProgressLine = (line: string): number | null =>
  parseProgressDetail(line)?.percent ?? null;

/** yt-dlp announces each file it starts downloading. */
export const isNewDestination = (line: string): boolean =>
  /^\[download\] Destination: /.test(line);

/**
 * Turns per-file percentages into one figure over a download made of `files`
 * parts, and decides when it is worth reporting: at each 25 % step, and at
 * least every `intervalMs` while the download goes on.
 */
export class ProgressTracker {
  private file = 0;

  private lastBucket = 0;

  private lastReportAt: number;

  /** The overall percentage last seen, reported or not. */
  latest = 0;

  /** Speed and time left from the last progress line. */
  speed = '';

  eta = '';

  constructor(
    private readonly files: number,
    private readonly intervalMs: number,
    now = Date.now(),
  ) {
    this.lastReportAt = now;
  }

  /** Feeds one output line; returns the overall percentage to report, if any. */
  feed(line: string, now = Date.now()): number | null {
    if (isNewDestination(line)) {
      this.file = Math.min(this.file + 1, this.files);
      return null;
    }

    const detail = parseProgressDetail(line);

    if (!detail) {
      return this.due(now) ? this.report(this.latest, now) : null;
    }

    const done = Math.max(0, this.file - 1) + detail.percent / 100;
    const overall = Math.min(99, Math.floor((done / this.files) * 100));
    const bucket = Math.floor(overall / 25);

    this.latest = overall;
    this.speed = detail.speed;
    this.eta = detail.eta;

    if (bucket > this.lastBucket) {
      this.lastBucket = bucket;
      return this.report(overall, now);
    }

    return this.due(now) ? this.report(overall, now) : null;
  }

  /** Whether a report is due even without new output. */
  due(now = Date.now()): boolean {
    return now - this.lastReportAt >= this.intervalMs;
  }

  markReported(now = Date.now()): void {
    this.lastReportAt = now;
  }

  private report(percent: number, now: number): number {
    this.lastReportAt = now;
    return percent;
  }
}
