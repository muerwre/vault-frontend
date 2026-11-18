import { RateLimiter } from './rate-limiter';

describe('RateLimiter', () => {
  let now = 0;
  const clock = () => now;

  beforeEach(() => {
    now = 1_000_000;
  });

  it('admits up to the limit within the window', () => {
    const limiter = new RateLimiter(2, 1000, clock);

    expect(limiter.take('a')).toBe(true);
    expect(limiter.take('a')).toBe(true);
    expect(limiter.take('a')).toBe(false);
  });

  it('counts keys separately', () => {
    const limiter = new RateLimiter(1, 1000, clock);

    expect(limiter.take('a')).toBe(true);
    expect(limiter.take('b')).toBe(true);
    expect(limiter.take('a')).toBe(false);
  });

  it('admits again once the window has passed', () => {
    const limiter = new RateLimiter(1, 1000, clock);

    expect(limiter.take('a')).toBe(true);

    now += 999;
    expect(limiter.take('a')).toBe(false);

    now += 1;
    expect(limiter.take('a')).toBe(true);
  });

  it('does not count refused hits', () => {
    const limiter = new RateLimiter(1, 1000, clock);

    limiter.take('a');
    now += 500;
    limiter.take('a');
    now += 500;

    expect(limiter.take('a')).toBe(true);
  });
});
