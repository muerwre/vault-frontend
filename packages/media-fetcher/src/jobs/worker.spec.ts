import type { MediaClaimedJob } from '@vault/common/media';

import type { BackendClient } from '../backend/api';
import { IntervalLimiter } from '../shared/limiter';
import type { YtDlpUpdater } from '../tools/updater';

import { blockPauseMs, Worker } from './worker';

const job = (id: number) => ({ id, kind: 'download' }) as MediaClaimedJob;

describe('blockPauseMs', () => {
  it('doubles with every block in a row, up to eight times the base', () => {
    expect(
      [1, 2, 3, 4, 5, 9].map((streak) => blockPauseMs(30, streak)),
    ).toEqual([30, 60, 120, 240, 240, 240]);
  });

  it('stays off when the base pause is off', () => {
    expect(blockPauseMs(0, 3)).toBe(0);
  });
});

describe('Worker', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  const setup = (claims: Array<MediaClaimedJob | null | Error>) => {
    const abort = new AbortController();
    const api = {
      claim: jest.fn(async () => {
        const next = claims.shift();
        if (next === undefined) {
          abort.abort();
          return null;
        }
        if (next instanceof Error) throw next;
        return next;
      }),
      fail: jest.fn(async (): Promise<void> => undefined),
    } as unknown as BackendClient & Record<string, jest.Mock>;
    const updater = {
      version: '2026.10.01',
      maybeUpdate: jest.fn(async (): Promise<void> => undefined),
      noteOutcome: jest.fn(async (): Promise<void> => undefined),
    } as unknown as YtDlpUpdater & Record<string, jest.Mock>;

    return { abort, api, updater };
  };

  it('runs each claimed job, reporting outcomes to the updater', async () => {
    const { abort, api, updater } = setup([job(1), job(2)]);
    const handler = jest.fn(async (_job: MediaClaimedJob) => ({
      extractorFailure: true,
      rateLimited: false,
    }));

    await new Worker('heavy', ['download'], handler, {
      api,
      limiter: new IntervalLimiter(0),
      updater,
      idlePollMs: 1,
      rateLimitPauseMs: 0,
    }).run(abort.signal);

    expect(handler.mock.calls.map(([claimed]) => claimed.id)).toEqual([1, 2]);
    expect(api.claim).toHaveBeenCalledWith(['download'], '2026.10.01');
    expect(updater.noteOutcome).toHaveBeenCalledWith(true);
    expect(updater.maybeUpdate).toHaveBeenCalled();
  });

  it('reports a job whose handler broke as retryable, then carries on', async () => {
    const { abort, api, updater } = setup([job(1), job(2)]);
    const handler = jest
      .fn()
      .mockRejectedValueOnce(new Error('disk full'))
      .mockResolvedValueOnce({ extractorFailure: false, rateLimited: false });

    await new Worker('heavy', ['download'], handler, {
      api,
      limiter: new IntervalLimiter(0),
      updater,
      idlePollMs: 1,
      rateLimitPauseMs: 0,
    }).run(abort.signal);

    expect(api.fail).toHaveBeenCalledWith(1, {
      reason: 'disk full',
      retryable: true,
    });
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('waits and tries again when there is no work or no backend', async () => {
    const { abort, api, updater } = setup([null, null, job(3)]);
    const handler = jest.fn(async (_job: MediaClaimedJob) => ({
      extractorFailure: false,
      rateLimited: false,
    }));

    await new Worker('heavy', ['download'], handler, {
      api,
      limiter: new IntervalLimiter(0),
      updater,
      idlePollMs: 1,
      rateLimitPauseMs: 0,
    }).run(abort.signal);

    expect(api.claim).toHaveBeenCalledTimes(4);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('stays away for a while after YouTube asked to slow down', async () => {
    const { abort, api, updater } = setup([job(1), job(2)]);
    const handler = jest
      .fn(async (_job: MediaClaimedJob) => ({
        extractorFailure: false,
        rateLimited: false,
      }))
      .mockResolvedValueOnce({ extractorFailure: false, rateLimited: true });

    const started = Date.now();

    await new Worker('heavy', ['download'], handler, {
      api,
      limiter: new IntervalLimiter(0),
      updater,
      idlePollMs: 1,
      rateLimitPauseMs: 300,
    }).run(abort.signal);

    expect(handler).toHaveBeenCalledTimes(2);
    expect(Date.now() - started).toBeGreaterThanOrEqual(290);
  });

  it('pauses longer while blocks keep coming, and resets after a success', async () => {
    const { abort, api, updater } = setup([job(1), job(2), job(3), job(4)]);
    const blocked = { extractorFailure: false, rateLimited: true };
    const fine = { extractorFailure: false, rateLimited: false };
    const handler = jest
      .fn()
      .mockResolvedValueOnce(blocked)
      .mockResolvedValueOnce(blocked)
      .mockResolvedValueOnce(fine)
      .mockResolvedValueOnce(blocked);
    const starts: number[] = [];
    const timed = jest.fn(async (claimed: MediaClaimedJob) => {
      starts.push(Date.now());
      return handler(claimed);
    });

    await new Worker('heavy', ['download'], timed, {
      api,
      limiter: new IntervalLimiter(0),
      updater,
      idlePollMs: 1,
      rateLimitPauseMs: 100,
    }).run(abort.signal);

    const gaps = starts.slice(1).map((at, i) => at - starts[i]);

    // 100 after the first block, 200 after the second, none after a success.
    expect(gaps[0]).toBeGreaterThanOrEqual(90);
    expect(gaps[1]).toBeGreaterThanOrEqual(190);
    expect(gaps[2]).toBeLessThan(90);
  });
});
