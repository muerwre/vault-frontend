import { sleep } from './sleep';

/** The gap varies by this much either way, so the timing is not machine-regular. */
const JITTER = 0.3;

/**
 * Keeps at least about `intervalMs` (±30 %) between the end of one job and the
 * start of the next, across every worker sharing it.
 */
export class IntervalLimiter {
  private lastDoneAt = 0;

  private queue: Promise<void> = Promise.resolve();

  constructor(
    private readonly intervalMs: number,
    private readonly now: () => number = Date.now,
    private readonly random: () => number = Math.random,
  ) {}

  /** Waits for this caller's turn; resolves early when `signal` aborts. */
  wait(signal?: AbortSignal): Promise<void> {
    const turn = this.queue.then(() => {
      const gap = this.intervalMs * (1 - JITTER + this.random() * JITTER * 2);

      return sleep(this.lastDoneAt + gap - this.now(), signal);
    });

    this.queue = turn;
    return turn;
  }

  done(): void {
    this.lastDoneAt = this.now();
  }
}
