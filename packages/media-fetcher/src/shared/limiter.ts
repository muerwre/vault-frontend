import { sleep } from './sleep';

/**
 * Keeps at least `intervalMs` between the end of one job and the start of the
 * next, across every worker sharing it.
 */
export class IntervalLimiter {
  private lastDoneAt = 0;

  private queue: Promise<void> = Promise.resolve();

  constructor(
    private readonly intervalMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** Waits for this caller's turn; resolves early when `signal` aborts. */
  wait(signal?: AbortSignal): Promise<void> {
    const turn = this.queue.then(() =>
      sleep(this.lastDoneAt + this.intervalMs - this.now(), signal),
    );

    this.queue = turn;
    return turn;
  }

  done(): void {
    this.lastDoneAt = this.now();
  }
}
