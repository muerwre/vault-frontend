import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import type { MediaClaimedJob } from '@vault/common/media';

import { BackendError, type BackendClient } from '../backend/api';
import { loadConfig } from '../config/config';
import type { MediaTools } from '../tools/media-tools';
import type { RunResult } from '../tools/run';
import type { YtFormat, YtInfo } from '../youtube/formats';
import { PROGRESS_MARKER } from '../youtube/progress';

import { runDownloadJob } from './download-job';

const MB = 1024 * 1024;

const ok = (output = ''): RunResult => ({ code: 0, output, stdout: '' });
const failed = (output: string): RunResult => ({ code: 1, output, stdout: '' });

const formats: YtFormat[] = [
  {
    format_id: '136',
    vcodec: 'avc1.64001f',
    acodec: 'none',
    height: 720,
    filesize: 90 * MB,
  },
  {
    format_id: '135',
    vcodec: 'avc1.4d401f',
    acodec: 'none',
    height: 480,
    filesize: 40 * MB,
  },
  {
    format_id: '134',
    vcodec: 'avc1.4d401e',
    acodec: 'none',
    height: 360,
    filesize: 20 * MB,
  },
  { format_id: '140', vcodec: 'none', acodec: 'mp4a.40.2', filesize: 5 * MB },
];

const info = (overrides: Partial<YtInfo> = {}): YtInfo => ({
  id: 'dQw4w9WgXcQ',
  duration: 212,
  formats,
  ...overrides,
});

const job: MediaClaimedJob = {
  id: 7,
  kind: 'download',
  provider: 'youtube',
  externalId: 'dQw4w9WgXcQ',
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  constraints: { maxDurationSec: 1800, maxBytes: 500 * MB },
  attempt: 1,
  leaseUntil: new Date().toISOString(),
};

type Downloader = MediaTools['download'];

/** Writes what a successful yt-dlp run leaves behind. */
const writesFiles =
  (thumbnail = true): Downloader =>
  async ({ dir, onLine }) => {
    onLine('[download] Destination: video.f136.mp4');
    onLine(`${PROGRESS_MARKER} 100%`);
    onLine('[download] Destination: video.f140.m4a');
    onLine(`${PROGRESS_MARKER} 100%`);
    writeFileSync(join(dir, 'video.mp4'), 'video bytes');
    if (thumbnail) writeFileSync(join(dir, 'thumb.jpg'), 'cover bytes');
    return ok();
  };

const setup = (options: {
  probe?: YtInfo | null;
  probeOutput?: string;
  downloads?: Downloader[];
  progress?: jest.Mock;
  maxBytes?: number;
}) => {
  const workDir = mkdtempSync(join(tmpdir(), 'fetcher-job-'));
  const downloads = [...(options.downloads ?? [writesFiles()])];

  const tools = {
    probe: jest.fn(async () => ({
      info: options.probe === undefined ? info() : options.probe,
      result: failed(options.probeOutput ?? ''),
    })),
    download: jest.fn((args: Parameters<Downloader>[0]) => {
      const next = downloads.shift();
      if (!next) throw new Error('unexpected download');
      return next(args);
    }),
    faststart: jest.fn(async (from: string, to: string) => {
      copyFileSync(from, to);
      return ok();
    }),
    describe: jest.fn(async () => ({
      duration: 213,
      width: 1280,
      height: 720,
    })),
  } satisfies Record<string, jest.Mock>;

  const api = {
    progress: options.progress ?? jest.fn(async (): Promise<void> => undefined),
    upload: jest.fn(async (..._args: unknown[]): Promise<void> => undefined),
    complete: jest.fn(async (): Promise<void> => undefined),
    fail: jest.fn(async (): Promise<void> => undefined),
    skip: jest.fn(async (): Promise<void> => undefined),
  } satisfies Record<string, jest.Mock>;

  const config = {
    ...loadConfig({
      MEDIA_BACKEND_URL: 'http://b/api',
      MEDIA_FETCHER_KEY: 'k',
    }),
    workDir,
  };

  const run = (signal?: AbortSignal) =>
    runDownloadJob(
      {
        ...job,
        constraints: {
          ...job.constraints,
          maxBytes: options.maxBytes ?? 500 * MB,
        },
      },
      {
        api: api as unknown as BackendClient,
        tools: tools as unknown as MediaTools,
        config,
        signal,
      },
    );

  return { api, tools, run, workDir };
};

describe('runDownloadJob', () => {
  const dirs: string[] = [];

  afterAll(() =>
    dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })),
  );

  const track = <T extends { workDir: string }>(value: T) => {
    dirs.push(value.workDir);
    return value;
  };

  it('downloads the best fitting quality, uploads video and cover, completes', async () => {
    const { api, tools, run, workDir } = track(setup({}));

    await expect(run()).resolves.toEqual({ extractorFailure: false });

    expect(tools.download).toHaveBeenCalledWith(
      expect.objectContaining({ spec: '136+140', maxBytes: 500 * MB }),
    );
    expect(api.progress).toHaveBeenCalledWith(7, 50, 'download');
    expect(api.progress).toHaveBeenLastCalledWith(7, 99, 'upload');
    expect(
      api.upload.mock.calls.map((call: unknown[]) => [
        call[1],
        String(call[2]).split('/').pop(),
        call[3],
      ]),
    ).toEqual([
      ['video', 'ready.mp4', 'video/mp4'],
      ['thumbnail', 'thumb.jpg', 'image/jpeg'],
    ]);
    expect(api.complete).toHaveBeenCalledWith(7, {
      video: { duration: 213, width: 1280, height: 720 },
    });
    expect(api.fail).not.toHaveBeenCalled();
    // The job's scratch directory is gone.
    expect(readdirSync(workDir)).toEqual([]);
  });

  it('completes without a cover when yt-dlp wrote none', async () => {
    const { api, run } = track(setup({ downloads: [writesFiles(false)] }));

    await run();

    expect(api.upload).toHaveBeenCalledTimes(1);
    expect(api.complete).toHaveBeenCalled();
  });

  it('chooses a lower quality when the top one is over the limit', async () => {
    const { tools, run } = track(setup({ maxBytes: 50 * MB }));

    await run();

    expect(tools.download).toHaveBeenCalledWith(
      expect.objectContaining({ spec: '135+140' }),
    );
  });

  it('tries one rung lower when the real file outgrows the cap', async () => {
    const tooBig: Downloader = async () =>
      ok(
        '[download] File is larger than max-filesize (600 bytes > 500 bytes). Aborting.',
      );
    const { tools, api, run } = track(
      setup({ downloads: [tooBig, writesFiles()] }),
    );

    await run();

    expect(tools.download.mock.calls.map(([args]) => args.spec)).toEqual([
      '136+140',
      '135+140',
    ]);
    expect(api.complete).toHaveBeenCalled();
  });

  it('skips as too big when the lower rung outgrows the cap too', async () => {
    const tooBig: Downloader = async () =>
      ok('File is larger than max-filesize');
    const { api, run } = track(setup({ downloads: [tooBig, tooBig] }));

    await run();

    expect(api.skip).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ reason: 'too_big' }),
    );
    expect(api.complete).not.toHaveBeenCalled();
  });

  it.each([
    [{ is_live: true }, { reason: 'live' }],
    [{ duration: 4000 }, { reason: 'too_long', duration: 4000 }],
  ])('skips %p without downloading', async (fields, expected) => {
    const { api, tools, run } = track(setup({ probe: info(fields) }));

    await run();

    expect(api.skip).toHaveBeenCalledWith(7, expected);
    expect(tools.download).not.toHaveBeenCalled();
  });

  it('skips as too big when no quality fits, with the smallest estimate', async () => {
    const { api, run } = track(setup({ maxBytes: 10 * MB }));

    await run();

    expect(api.skip).toHaveBeenCalledWith(7, {
      reason: 'too_big',
      duration: 212,
      estimatedBytes: 25 * MB,
    });
  });

  it('gives up on a removed video', async () => {
    const { api, run } = track(
      setup({
        probe: null,
        probeOutput: 'ERROR: [youtube] x: Video unavailable',
      }),
    );

    await expect(run()).resolves.toEqual({ extractorFailure: false });

    expect(api.fail).toHaveBeenCalledWith(7, {
      reason: 'ERROR: [youtube] x: Video unavailable',
      retryable: false,
    });
  });

  it('retries a bot check and flags it as a possible yt-dlp problem', async () => {
    const blocked: Downloader = async () =>
      failed("ERROR: [youtube] x: Sign in to confirm you're not a bot");
    const { api, run } = track(setup({ downloads: [blocked] }));

    await expect(run()).resolves.toEqual({ extractorFailure: true });

    expect(api.fail).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ retryable: true }),
    );
  });

  it('fails for good when no H.264/AAC format exists', async () => {
    const { api, run } = track(
      setup({
        probe: info({
          formats: [
            { format_id: '248', vcodec: 'vp9', acodec: 'none', height: 720 },
          ],
        }),
      }),
    );

    await run();

    expect(api.fail).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ retryable: false }),
    );
  });

  it('stops quietly when the job was taken away mid-download', async () => {
    const progress = jest.fn(async () => {
      throw new BackendError(409, '/jobs/7/progress');
    });
    const waitsForAbort: Downloader = ({ onLine, signal }) =>
      new Promise((resolve) => {
        onLine('[download] Destination: video.f136.mp4');
        // 60 % of the first of two files: 30 % overall, a reportable step.
        onLine(`${PROGRESS_MARKER} 60%`);
        signal?.addEventListener('abort', () => resolve(failed('killed')));
      });
    const { api, run, workDir } = track(
      setup({ downloads: [waitsForAbort], progress }),
    );

    await expect(run()).resolves.toEqual({ extractorFailure: false });

    expect(api.fail).not.toHaveBeenCalled();
    expect(api.complete).not.toHaveBeenCalled();
    expect(existsSync(workDir) && readdirSync(workDir)).toEqual([]);
  });

  it('hands an interrupted job back for a retry', async () => {
    const abort = new AbortController();
    const interrupted: Downloader = async () => {
      abort.abort();
      return failed('killed');
    };
    const { api, run } = track(setup({ downloads: [interrupted] }));

    await run(abort.signal);

    expect(api.fail).toHaveBeenCalledWith(7, {
      reason: 'fetcher stopping',
      retryable: true,
    });
  });
});
