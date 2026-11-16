import { randomBytes } from 'crypto';
import { access, mkdir, rm } from 'fs/promises';
import { join } from 'path';

import {
  MEDIA_JOB_STAGES,
  MEDIA_SKIP_REASONS,
  MEDIA_UPLOAD_SLOTS,
  type MediaClaimedJob,
} from '@vault/common/media';

import { BackendError, type BackendClient } from '../backend/api';
import type { FetcherConfig } from '../config/config';
import { DOWNLOADED, THUMBNAIL, type MediaTools } from '../tools/media-tools';
import { classifyFailure, isOverMaxFilesize } from '../youtube/errors';
import { isLive, pickFormat } from '../youtube/formats';
import { ProgressTracker } from '../youtube/progress';

/** Longest silence before progress is reported anyway, to keep the lease. */
export const HEARTBEAT_MS = 2 * 60 * 1000;

/** How a job ended, as far as the worker cares. */
export interface JobOutcome {
  /** A failure a newer yt-dlp might fix. */
  extractorFailure: boolean;
}

const exists = (path: string) =>
  access(path).then(
    () => true,
    () => false,
  );

/** The job is no longer this fetcher's; nothing more to report. */
class JobLost extends Error {}

/**
 * Downloads one video at the best quality that fits the job's limits and hands
 * it to the backend. Every way it can end is reported: complete, skip or fail.
 */
export const runDownloadJob = async (
  job: MediaClaimedJob,
  deps: {
    api: BackendClient;
    tools: MediaTools;
    config: FetcherConfig;
    signal?: AbortSignal;
  },
): Promise<JobOutcome> => {
  const { api, tools, config, signal } = deps;
  const dir = join(
    config.workDir,
    `job-${job.id}-${randomBytes(4).toString('hex')}`,
  );

  /** Backend calls; a lost lease ends the job without further reports. */
  const guard = async <T>(call: () => Promise<T>): Promise<T> => {
    try {
      return await call();
    } catch (error) {
      if (error instanceof BackendError && error.lostJob) {
        throw new JobLost();
      }
      throw error;
    }
  };

  const fail = async (output: string, retryable?: boolean) => {
    const verdict = classifyFailure(output);

    await guard(() =>
      api.fail(job.id, {
        reason: verdict.reason,
        retryable: retryable ?? verdict.retryable,
      }),
    );

    return { extractorFailure: verdict.extractor };
  };

  await mkdir(dir, { recursive: true });

  try {
    const { info, result: probed } = await tools.probe(job.url, signal);

    if (signal?.aborted) {
      return await fail('fetcher stopping', true);
    }

    if (!info) {
      return await fail(probed.output);
    }

    const { maxDurationSec, maxBytes } = job.constraints;
    const duration = info.duration ?? undefined;

    if (isLive(info)) {
      await guard(() => api.skip(job.id, { reason: MEDIA_SKIP_REASONS.LIVE }));
      return { extractorFailure: false };
    }

    if (duration && duration > maxDurationSec) {
      await guard(() =>
        api.skip(job.id, { reason: MEDIA_SKIP_REASONS.TOO_LONG, duration }),
      );
      return { extractorFailure: false };
    }

    let fromRung = 0;

    // The estimate only picks the quality; if the real file outgrows the cap,
    // one more try is made a rung lower.
    for (let tries = 0; tries < 2; tries += 1) {
      const choice = pickFormat(info, config.qualityLadder, maxBytes, fromRung);

      if (choice.kind === 'no_format') {
        return await fail('ERROR: no H.264/AAC format offered', false);
      }

      if (choice.kind === 'too_big') {
        await guard(() =>
          api.skip(job.id, {
            reason: MEDIA_SKIP_REASONS.TOO_BIG,
            duration,
            estimatedBytes: choice.estimatedBytes,
          }),
        );
        return { extractorFailure: false };
      }

      const downloaded = await download(job, choice.spec, dir, maxBytes, deps);

      if (signal?.aborted) {
        return await fail('fetcher stopping', true);
      }

      if (downloaded.ok) {
        break;
      }

      if (isOverMaxFilesize(downloaded.output) && tries === 0) {
        fromRung = choice.rung + 1;
        continue;
      }

      if (isOverMaxFilesize(downloaded.output)) {
        await guard(() =>
          api.skip(job.id, {
            reason: MEDIA_SKIP_REASONS.TOO_BIG,
            duration,
            estimatedBytes: maxBytes + 1,
          }),
        );
        return { extractorFailure: false };
      }

      return await fail(downloaded.output);
    }

    const ready = join(dir, 'ready.mp4');
    const fixed = await tools.faststart(join(dir, DOWNLOADED), ready, signal);

    if (fixed.code !== 0) {
      return await fail(
        `ERROR: ffmpeg could not finish the file: ${fixed.output}`,
        true,
      );
    }

    const facts = await tools.describe(ready);

    await guard(() => api.progress(job.id, 99, MEDIA_JOB_STAGES.UPLOAD));
    await guard(() =>
      api.upload(job.id, MEDIA_UPLOAD_SLOTS.VIDEO, ready, 'video/mp4'),
    );

    if (await exists(join(dir, THUMBNAIL))) {
      await guard(() =>
        api.upload(
          job.id,
          MEDIA_UPLOAD_SLOTS.THUMBNAIL,
          join(dir, THUMBNAIL),
          'image/jpeg',
        ),
      );
    }

    await guard(() =>
      api.complete(job.id, {
        video: {
          duration: facts?.duration ?? duration,
          width: facts?.width,
          height: facts?.height,
        },
      }),
    );

    return { extractorFailure: false };
  } catch (error) {
    if (error instanceof JobLost) {
      return { extractorFailure: false };
    }

    throw error;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};

/** One yt-dlp download, reporting progress as it goes. */
const download = async (
  job: MediaClaimedJob,
  spec: string,
  dir: string,
  maxBytes: number,
  deps: { api: BackendClient; tools: MediaTools; signal?: AbortSignal },
): Promise<{ ok: boolean; output: string }> => {
  const tracker = new ProgressTracker(spec.includes('+') ? 2 : 1, HEARTBEAT_MS);
  let last = 0;
  let lost = false;
  const stop = new AbortController();
  const signal = deps.signal
    ? AbortSignal.any([deps.signal, stop.signal])
    : stop.signal;

  const report = (percent: number) => {
    last = percent;
    tracker.markReported();
    deps.api
      .progress(job.id, percent, MEDIA_JOB_STAGES.DOWNLOAD)
      .catch((error: unknown) => {
        // Someone else holds the job now: stop downloading it.
        if (error instanceof BackendError && error.lostJob) {
          lost = true;
          stop.abort();
        }
      });
  };

  // Output can stall for long stretches (a slow merge, throttling).
  const heartbeat = setInterval(() => {
    if (tracker.heartbeatDue()) {
      report(last);
    }
  }, 30_000);
  heartbeat.unref();

  try {
    const result = await deps.tools.download({
      url: job.url,
      spec,
      dir,
      maxBytes,
      signal,
      onLine: (line) => {
        const percent = tracker.feed(line);

        if (percent !== null) {
          report(percent);
        }
      },
    });

    if (lost) {
      throw new JobLost();
    }

    return {
      ok: result.code === 0 && (await exists(join(dir, DOWNLOADED))),
      output: result.output,
    };
  } finally {
    clearInterval(heartbeat);
  }
};
