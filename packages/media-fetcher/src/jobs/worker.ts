import type { MediaClaimedJob, MediaJobKind } from '@vault/common/media';

import type { BackendClient } from '../backend/api';
import type { IntervalLimiter } from '../shared/limiter';
import { describeError, log } from '../shared/log';
import { sleep } from '../shared/sleep';
import type { YtDlpUpdater } from '../tools/updater';

import type { JobOutcome } from './download-job';

export type JobHandler = (
  job: MediaClaimedJob,
  signal: AbortSignal,
) => Promise<JobOutcome>;

/** `300000` → `5 min`, `30000` → `30s`. */
const describeWait = (ms: number): string =>
  ms >= 60_000 && ms % 60_000 === 0
    ? `${ms / 60_000} min`
    : `${Math.round(ms / 1000)}s`;

/** Wait after the backend could not be reached. */
const BACKEND_RETRY_MS = 30_000;

/** The pause after a block doubles each time in a row, up to this multiple. */
const MAX_PAUSE_FACTOR = 8;

/** Pause after the `streak`-th block in a row: base, then twice, four times… */
export const blockPauseMs = (baseMs: number, streak: number): number =>
  baseMs * Math.min(2 ** Math.max(streak - 1, 0), MAX_PAUSE_FACTOR);

/**
 * Claims jobs of its kinds one at a time and runs them, until `signal` aborts.
 * A job interrupted by shutdown is reported as a retryable failure, so another
 * run picks it up.
 */
export class Worker {
  constructor(
    private readonly name: string,
    private readonly kinds: MediaJobKind[],
    private readonly handler: JobHandler,
    private readonly deps: {
      api: BackendClient;
      limiter: IntervalLimiter;
      updater: YtDlpUpdater;
      idlePollMs: number;
      /** Pause after YouTube first refused the fetcher; grows if it keeps doing so. */
      rateLimitPauseMs: number;
    },
  ) {}

  async run(signal: AbortSignal): Promise<void> {
    log.info(`${this.name}: taking ${this.kinds.join(', ')} jobs`);

    /** So an empty queue is mentioned once, not on every poll. */
    let idle = false;
    /** Jobs in a row YouTube refused; the next success clears it. */
    let blocks = 0;

    while (!signal.aborted) {
      await this.deps.updater.maybeUpdate();

      let job: MediaClaimedJob | null;

      try {
        job = await this.deps.api.claim(this.kinds, this.deps.updater.version);
      } catch (error) {
        log.error(`${this.name}: claim failed: ${describeError(error)}`);
        await sleep(BACKEND_RETRY_MS, signal);
        continue;
      }

      if (!job) {
        if (!idle) {
          log.info(
            `${this.name}: nothing to do, asking again every ${describeWait(
              this.deps.idlePollMs,
            )}`,
          );
          idle = true;
        }

        await sleep(this.deps.idlePollMs, signal);
        continue;
      }

      idle = false;

      await this.deps.limiter.wait(signal);
      const outcome = await this.runJob(job, signal);
      this.deps.limiter.done();

      if (!outcome) {
        continue;
      }

      if (!outcome.rateLimited) {
        blocks = 0;
        continue;
      }

      blocks += 1;
      const pauseMs = blockPauseMs(this.deps.rateLimitPauseMs, blocks);

      if (pauseMs > 0) {
        log.info(
          `${this.name}: YouTube is refusing us (${blocks} in a row), pausing ${Math.round(
            pauseMs / 60_000,
          )} min`,
        );
        await sleep(pauseMs, signal);
      }
    }

    log.info(`${this.name}: stopped`);
  }

  private async runJob(
    job: MediaClaimedJob,
    signal: AbortSignal,
  ): Promise<JobOutcome | null> {
    log.info(
      `${this.name}: job ${job.id} ${job.kind} ${job.provider}:${job.externalId} (try ${job.attempt})`,
    );

    try {
      const outcome = await this.handler(job, signal);
      await this.deps.updater.noteOutcome(outcome.extractorFailure);
      log.info(`${this.name}: job ${job.id} finished`);

      return outcome;
    } catch (error) {
      log.error(`${this.name}: job ${job.id} broke: ${describeError(error)}`);

      await this.deps.api
        .fail(job.id, { reason: describeError(error), retryable: true })
        .catch((reportError: unknown) =>
          log.error(
            `${this.name}: could not report job ${job.id}: ${describeError(reportError)}`,
          ),
        );

      return null;
    }
  }
}
