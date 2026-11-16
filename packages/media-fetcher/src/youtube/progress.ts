/** Marker the `--progress-template` puts before each percentage. */
export const PROGRESS_MARKER = '[vault-progress]';

/** `--progress-template` value producing lines {@link parseProgressLine} reads. */
export const PROGRESS_TEMPLATE = `download:${PROGRESS_MARKER} %(progress._percent_str)s`;

/** The percentage on one line of yt-dlp output, or null. */
export const parseProgressLine = (line: string): number | null => {
  const index = line.indexOf(PROGRESS_MARKER);

  if (index < 0) {
    return null;
  }

  const match = /([\d.]+)\s*%/.exec(line.slice(index + PROGRESS_MARKER.length));
  const value = match ? Number(match[1]) : NaN;

  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : null;
};

/** yt-dlp announces each file it starts downloading. */
export const isNewDestination = (line: string): boolean =>
  /^\[download\] Destination: /.test(line);

/**
 * Turns per-file percentages into one figure over a download made of `files`
 * parts, and decides when it is worth reporting: at each 25 % step, or when
 * nothing was reported for `heartbeatMs`, so the lease stays alive.
 */
export class ProgressTracker {
  private file = 0;

  private lastBucket = 0;

  private lastReportAt: number;

  constructor(
    private readonly files: number,
    private readonly heartbeatMs: number,
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

    const percent = parseProgressLine(line);

    if (percent === null) {
      return now - this.lastReportAt >= this.heartbeatMs
        ? this.report(this.lastBucket * 25, now)
        : null;
    }

    const done = Math.max(0, this.file - 1) + percent / 100;
    const overall = Math.min(99, Math.floor((done / this.files) * 100));
    const bucket = Math.floor(overall / 25);

    if (bucket > this.lastBucket) {
      this.lastBucket = bucket;
      return this.report(overall, now);
    }

    return now - this.lastReportAt >= this.heartbeatMs
      ? this.report(overall, now)
      : null;
  }

  /** Whether a heartbeat is due even without new output. */
  heartbeatDue(now = Date.now()): boolean {
    return now - this.lastReportAt >= this.heartbeatMs;
  }

  markReported(now = Date.now()): void {
    this.lastReportAt = now;
  }

  private report(percent: number, now: number): number {
    this.lastReportAt = now;
    return percent;
  }
}
