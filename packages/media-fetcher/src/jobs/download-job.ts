import { randomBytes } from 'crypto';
import { access, mkdir, rm, stat } from 'fs/promises';
import { join } from 'path';

import {
  heightLimitFor,
  maxKeptDuration,
  MEDIA_JOB_STAGES,
  MEDIA_SKIP_REASONS,
  MEDIA_UPLOAD_SLOTS,
  type MediaClaimedJob,
} from '@vault/common/media';

import { BackendError, type BackendClient } from '../backend/api';
import type { FetcherConfig } from '../config/config';
import { describeError, log } from '../shared/log';
import { DOWNLOADED, THUMBNAIL, type MediaTools } from '../tools/media-tools';
import { classifyFailure, isOverMaxFilesize } from '../youtube/errors';
import { isLive, pickFormat } from '../youtube/formats';
import { ProgressTracker } from '../youtube/progress';

/** Progress is reported at least this often, which also keeps the lease. */
export const PROGRESS_REPORT_MS = 60 * 1000;

const MB = 1024 * 1024;

const megabytes = (bytes: number) => `${(bytes / MB).toFixed(1)} MB`;

const clock = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(Math.floor(seconds % 60)).padStart(2, '0');

  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
};

/** How a job ended, as far as the worker cares. */
export interface JobOutcome {
  /** A failure a newer yt-dlp might fix. */
  extractorFailure: boolean;
  /** YouTube asked to slow down. */
  rateLimited: boolean;
}

const FINE: JobOutcome = { extractorFailure: false, rateLimited: false };

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
  const startedAt = Date.now();
  const say = (message: string) => log.info(`job ${job.id}: ${message}`);
  const elapsed = () => clock((Date.now() - startedAt) / 1000);
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
    const willRetry = retryable ?? verdict.retryable;

    say(
      `failed after ${elapsed()}, ${willRetry ? 'will be retried' : 'for good'}` +
        `${verdict.rateLimited ? ' (YouTube is throttling)' : ''}: ${verdict.reason}`,
    );

    await guard(() =>
      api.fail(job.id, {
        reason: verdict.reason,
        retryable: willRetry,
        blocked: willRetry && verdict.rateLimited,
      }),
    );

    return {
      extractorFailure: verdict.extractor,
      rateLimited: verdict.rateLimited,
    };
  };

  const skip = async (
    reason: (typeof MEDIA_SKIP_REASONS)[keyof typeof MEDIA_SKIP_REASONS],
    detail: string,
    fields: { duration?: number; estimatedBytes?: number } = {},
  ) => {
    say(`skipped, ${detail}`);
    await guard(() => api.skip(job.id, { reason, ...fields }));
    return FINE;
  };

  await mkdir(dir, { recursive: true });

  try {
    say(`checking ${job.url} (try ${job.attempt})`);
    const { info, result: probed } = await tools.probe(job.url, signal);

    if (signal?.aborted) {
      return await fail('fetcher stopping', true);
    }

    if (!info) {
      return await fail(probed.output);
    }

    const { maxDurationSec, maxBytes } = job.constraints;
    const duration = info.duration ?? undefined;

    say(
      `"${info.title ?? job.externalId}", ${duration ? clock(duration) : 'length unknown'}`,
    );

    if (isLive(info)) {
      return await skip(MEDIA_SKIP_REASONS.LIVE, 'a live stream');
    }

    // A backend predating quality tiers sends only the overall limit.
    const tiers = job.constraints.qualityTiers?.length
      ? job.constraints.qualityTiers
      : [{ maxDurationSec, maxHeight: Math.max(...config.qualityLadder) }];
    const heightLimit = heightLimitFor(tiers, duration);

    if (heightLimit === null) {
      return await skip(
        MEDIA_SKIP_REASONS.TOO_LONG,
        `longer than ${clock(maxKeptDuration(tiers))}`,
        { duration },
      );
    }

    // The tier caps the ladder; the size limit may push it lower still.
    const allowed = config.qualityLadder.filter(
      (height) => height <= heightLimit,
    );
    const ladder = allowed.length > 0 ? allowed : [heightLimit];

    say(`its length allows up to ${heightLimit}p`);

    let fromRung = 0;

    // The estimate only picks the quality; if the real file outgrows the cap,
    // one more try is made a rung lower.
    for (let tries = 0; tries < 2; tries += 1) {
      const choice = pickFormat(info, ladder, maxBytes, fromRung);

      if (choice.kind === 'no_format') {
        return await fail('ERROR: no H.264/AAC format offered', false);
      }

      if (choice.kind === 'too_big') {
        return await skip(
          MEDIA_SKIP_REASONS.TOO_BIG,
          `even the lowest quality is ~${megabytes(choice.estimatedBytes)}, over ${megabytes(maxBytes)}`,
          { duration, estimatedBytes: choice.estimatedBytes },
        );
      }

      say(
        `downloading ${choice.height}p (${choice.spec}), ` +
          (choice.estimatedBytes
            ? `~${megabytes(choice.estimatedBytes)}`
            : 'size unknown'),
      );

      const downloaded = await download(job, choice.spec, dir, maxBytes, {
        ...deps,
        say,
      });

      if (signal?.aborted) {
        return await fail('fetcher stopping', true);
      }

      if (downloaded.ok) {
        break;
      }

      if (isOverMaxFilesize(downloaded.output) && tries === 0) {
        say(
          `${choice.height}p turned out bigger than ${megabytes(maxBytes)}, trying lower`,
        );
        fromRung = choice.rung + 1;
        continue;
      }

      if (isOverMaxFilesize(downloaded.output)) {
        return await skip(
          MEDIA_SKIP_REASONS.TOO_BIG,
          `still bigger than ${megabytes(maxBytes)} a quality lower`,
          { duration, estimatedBytes: maxBytes + 1 },
        );
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
    const size = (await stat(ready)).size;

    // `--max-filesize` caps each stream, not the merged file, and streams of
    // unknown size were taken on trust: the finished file is what counts.
    if (size > maxBytes) {
      return await skip(
        MEDIA_SKIP_REASONS.TOO_BIG,
        `the finished file is ${megabytes(size)}, over ${megabytes(maxBytes)}`,
        { duration, estimatedBytes: size },
      );
    }

    say(`uploading ${megabytes(size)}`);
    await guard(() => api.progress(job.id, 99, MEDIA_JOB_STAGES.UPLOAD));

    try {
      await guard(() =>
        api.upload(job.id, MEDIA_UPLOAD_SLOTS.VIDEO, ready, 'video/mp4'),
      );
    } catch (error) {
      // The backend's own limit decides in the end; retrying would not help.
      if (error instanceof BackendError && error.status === 413) {
        return await skip(
          MEDIA_SKIP_REASONS.TOO_BIG,
          `the backend refused ${megabytes(size)} as too big`,
          { duration, estimatedBytes: size },
        );
      }

      throw error;
    }

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

    say(
      `done in ${elapsed()}: ${facts?.width ?? '?'}×${facts?.height ?? '?'}, ` +
        `${clock(facts?.duration ?? duration ?? 0)}, ${megabytes(size)}`,
    );

    return FINE;
  } catch (error) {
    if (error instanceof JobLost) {
      say('taken away by the backend (lease lost), dropped');
      return FINE;
    }

    say(`broke after ${elapsed()}: ${describeError(error)}`);
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
  deps: {
    api: BackendClient;
    tools: MediaTools;
    signal?: AbortSignal;
    say: (message: string) => void;
  },
): Promise<{ ok: boolean; output: string }> => {
  const tracker = new ProgressTracker(
    spec.includes('+') ? 2 : 1,
    PROGRESS_REPORT_MS,
  );
  let lost = false;
  const stop = new AbortController();
  const signal = deps.signal
    ? AbortSignal.any([deps.signal, stop.signal])
    : stop.signal;

  const report = (percent: number) => {
    tracker.markReported();
    deps.say(
      [`${percent}%`, tracker.speed, tracker.eta && `eta ${tracker.eta}`]
        .filter(Boolean)
        .join(' · '),
    );
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
    if (tracker.due()) {
      report(tracker.latest);
    }
  }, 15_000);
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
