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

/** Wait after the backend could not be reached. */
const BACKEND_RETRY_MS = 30_000;

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
    },
  ) {}

  async run(signal: AbortSignal): Promise<void> {
    log.info(`${this.name}: taking ${this.kinds.join(', ')} jobs`);

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
        await sleep(this.deps.idlePollMs, signal);
        continue;
      }

      await this.deps.limiter.wait(signal);
      await this.runJob(job, signal);
      this.deps.limiter.done();
    }

    log.info(`${this.name}: stopped`);
  }

  private async runJob(job: MediaClaimedJob, signal: AbortSignal) {
    log.info(
      `${this.name}: job ${job.id} ${job.kind} ${job.provider}:${job.externalId} (try ${job.attempt})`,
    );

    try {
      const outcome = await this.handler(job, signal);
      await this.deps.updater.noteOutcome(outcome.extractorFailure);
      log.info(`${this.name}: job ${job.id} finished`);
    } catch (error) {
      log.error(`${this.name}: job ${job.id} broke: ${describeError(error)}`);

      await this.deps.api
        .fail(job.id, { reason: describeError(error), retryable: true })
        .catch((reportError: unknown) =>
          log.error(
            `${this.name}: could not report job ${job.id}: ${describeError(reportError)}`,
          ),
        );
    }
  }
}
