import type { MediaTools } from './media-tools';
import type { RunResult } from './run';
import { YtDlpUpdater } from './updater';

const tools = (versions: string[]) =>
  ({
    updateYtDlp: jest.fn(
      async (): Promise<RunResult> => ({ code: 0, output: '', stdout: '' }),
    ),
    ytDlpVersion: jest.fn(async () => versions.shift() ?? 'same'),
  }) as unknown as MediaTools & {
    updateYtDlp: jest.Mock;
    ytDlpVersion: jest.Mock;
  };

describe('YtDlpUpdater', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('updates on start and records the version', async () => {
    const fake = tools(['2026.10.01']);
    const updater = new YtDlpUpdater(fake, 24);

    await updater.start();

    expect(fake.updateYtDlp).toHaveBeenCalledTimes(1);
    expect(updater.version).toBe('2026.10.01');
  });

  it('only reads the version when updates are off', async () => {
    const fake = tools(['2026.10.01']);
    const updater = new YtDlpUpdater(fake, 0);

    await updater.start();
    await updater.noteOutcome(true);
    await updater.noteOutcome(true);
    await updater.noteOutcome(true);

    expect(fake.updateYtDlp).not.toHaveBeenCalled();
    expect(updater.version).toBe('2026.10.01');
  });

  it('updates again once the interval has passed', async () => {
    let now = 0;
    const fake = tools([]);
    const updater = new YtDlpUpdater(fake, 24, () => now);

    await updater.start();
    now = 23 * 3600_000;
    await updater.maybeUpdate();
    now = 24 * 3600_000;
    await updater.maybeUpdate();

    expect(fake.updateYtDlp).toHaveBeenCalledTimes(2);
  });

  it('updates early after three extractor failures in a row, at most hourly', async () => {
    let now = 0;
    const fake = tools([]);
    const updater = new YtDlpUpdater(fake, 24, () => now);

    await updater.start();
    now = 2 * 3600_000;

    await updater.noteOutcome(true);
    await updater.noteOutcome(false);
    await updater.noteOutcome(true);
    await updater.noteOutcome(true);
    expect(fake.updateYtDlp).toHaveBeenCalledTimes(1);

    await updater.noteOutcome(true);
    expect(fake.updateYtDlp).toHaveBeenCalledTimes(2);

    for (let i = 0; i < 3; i += 1) await updater.noteOutcome(true);
    expect(fake.updateYtDlp).toHaveBeenCalledTimes(2);
  });

  it('keeps going when the update fails', async () => {
    const fake = tools(['old']);
    fake.updateYtDlp.mockResolvedValueOnce({
      code: 1,
      output: 'ERROR: no network',
      stdout: '',
    });
    const updater = new YtDlpUpdater(fake, 24);

    await updater.start();

    expect(updater.version).toBe('old');
  });
});
