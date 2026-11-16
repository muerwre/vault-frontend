import { describeError, log } from '../shared/log';

import type { MediaTools } from './media-tools';

/** Extractor failures in a row that suggest yt-dlp is out of date. */
const SUSPICIOUS_STREAK = 3;

/** Updates triggered by failures are at least this far apart. */
const MIN_GAP_MS = 60 * 60 * 1000;

/**
 * Keeps yt-dlp current: on start, every `everyHours`, and early after a streak
 * of failures that look like YouTube outpacing it. A failed update is logged
 * and the installed version keeps working.
 */
export class YtDlpUpdater {
  version = 'unknown';

  private streak = 0;

  private lastUpdateAt = 0;

  private updating?: Promise<void>;

  constructor(
    private readonly tools: MediaTools,
    private readonly everyHours: number,
    private readonly now: () => number = Date.now,
  ) {}

  get enabled(): boolean {
    return this.everyHours > 0;
  }

  /** Reads the version, updating first when updates are on. */
  async start(): Promise<void> {
    if (this.enabled) {
      await this.update();
    } else {
      this.version = await this.tools.ytDlpVersion();
      log.info(`yt-dlp ${this.version}, updates off`);
    }
  }

  /** Whether the regular update is due; called between jobs. */
  async maybeUpdate(): Promise<void> {
    if (
      this.enabled &&
      this.now() - this.lastUpdateAt >= this.everyHours * 60 * 60 * 1000
    ) {
      await this.update();
    }
  }

  /** Records how a job went; a long enough bad streak updates early. */
  async noteOutcome(extractorFailure: boolean): Promise<void> {
    this.streak = extractorFailure ? this.streak + 1 : 0;

    if (
      this.enabled &&
      this.streak >= SUSPICIOUS_STREAK &&
      this.now() - this.lastUpdateAt >= MIN_GAP_MS
    ) {
      log.info(`${this.streak} extractor failures in a row, updating yt-dlp`);
      this.streak = 0;
      await this.update();
    }
  }

  update(): Promise<void> {
    this.updating ??= this.runUpdate().finally(() => {
      this.updating = undefined;
    });

    return this.updating;
  }

  private async runUpdate(): Promise<void> {
    this.lastUpdateAt = this.now();

    try {
      const result = await this.tools.updateYtDlp();

      if (result.code !== 0) {
        log.error(
          `yt-dlp update failed: ${result.output.trim().split('\n').pop()}`,
        );
      }
    } catch (error) {
      log.error(`yt-dlp update failed: ${describeError(error)}`);
    }

    try {
      this.version = await this.tools.ytDlpVersion();
      log.info(`yt-dlp ${this.version}`);
    } catch (error) {
      log.error(`yt-dlp is not runnable: ${describeError(error)}`);
    }
  }
}
