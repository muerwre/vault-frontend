/**
 * In-memory sliding-window limiter. Counts reset on restart, which is fine
 * for slowing down abuse of public forms.
 */
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** Records a hit and answers whether it was within the limit. */
  take(key: string): boolean {
    const now = this.now();
    const recent = (this.hits.get(key) ?? []).filter(
      (time) => now - time < this.windowMs,
    );

    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }

    recent.push(now);
    this.hits.set(key, recent);
    this.prune(now);

    return true;
  }

  /** Drops keys whose hits have all expired, so the map does not grow forever. */
  private prune(now: number): void {
    if (this.hits.size < 1000) {
      return;
    }

    for (const [key, times] of this.hits) {
      if (times.every((time) => now - time >= this.windowMs)) {
        this.hits.delete(key);
      }
    }
  }
}
