import { IntervalLimiter } from './limiter';

describe('IntervalLimiter', () => {
  it('lets the first caller through and spaces the next', async () => {
    const limiter = new IntervalLimiter(200, Date.now, () => 0.5);
    const started = Date.now();

    await limiter.wait();
    expect(Date.now() - started).toBeLessThan(100);

    limiter.done();
    await limiter.wait();
    expect(Date.now() - started).toBeGreaterThanOrEqual(190);
  });

  it('stops waiting on abort', async () => {
    const limiter = new IntervalLimiter(10_000);
    const abort = new AbortController();

    limiter.done();
    const waiting = limiter.wait(abort.signal);
    abort.abort();

    await expect(waiting).resolves.toBeUndefined();
  });

  it('varies the gap by up to 30 % either way', async () => {
    let now = 1_000_000;
    const waits: number[] = [];

    for (const random of [0, 1]) {
      const limiter = new IntervalLimiter(
        1000,
        () => now,
        () => random,
      );
      limiter.done();
      const started = Date.now();
      // the wait is computed against the fixed clock, so it runs in real time
      now += 0;
      await limiter.wait(AbortSignal.timeout(2000));
      waits.push(Date.now() - started);
    }

    expect(waits[0]).toBeGreaterThanOrEqual(690);
    expect(waits[0]).toBeLessThan(900);
    expect(waits[1]).toBeGreaterThanOrEqual(1290);
  });
});
