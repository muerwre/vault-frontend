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
    if (this.isLimited(key)) {
      return false;
    }

    this.hit(key);

    return true;
  }

  /** Whether the key has used up its hits, without recording one. */
  isLimited(key: string): boolean {
    return this.recent(key, this.now()).length >= this.limit;
  }

  /** Records a hit regardless of the limit, e.g. a failed login. */
  hit(key: string): void {
    const now = this.now();
    const recent = this.recent(key, now);

    recent.push(now);
    this.hits.set(key, recent);
    this.prune(now);
  }

  private recent(key: string, now: number): number[] {
    return (this.hits.get(key) ?? []).filter(
      (time) => now - time < this.windowMs,
    );
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
