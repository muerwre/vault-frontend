import { IntervalLimiter } from './limiter';

describe('IntervalLimiter', () => {
  it('lets the first caller through and spaces the next', async () => {
    const limiter = new IntervalLimiter(200);
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
});
