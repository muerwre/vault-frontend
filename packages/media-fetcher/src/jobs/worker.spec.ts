import type { MediaClaimedJob } from '@vault/common/media';

import type { BackendClient } from '../backend/api';
import { IntervalLimiter } from '../shared/limiter';
import type { YtDlpUpdater } from '../tools/updater';

import { Worker } from './worker';

const job = (id: number) => ({ id, kind: 'download' }) as MediaClaimedJob;

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
    }));

    await new Worker('heavy', ['download'], handler, {
      api,
      limiter: new IntervalLimiter(0),
      updater,
      idlePollMs: 1,
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
      .mockResolvedValueOnce({ extractorFailure: false });

    await new Worker('heavy', ['download'], handler, {
      api,
      limiter: new IntervalLimiter(0),
      updater,
      idlePollMs: 1,
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
    }));

    await new Worker('heavy', ['download'], handler, {
      api,
      limiter: new IntervalLimiter(0),
      updater,
      idlePollMs: 1,
    }).run(abort.signal);

    expect(api.claim).toHaveBeenCalledTimes(4);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
