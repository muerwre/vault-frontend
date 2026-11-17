import { createHash, randomBytes } from 'crypto';
import { createWriteStream } from 'fs';
import { mkdir, rename, stat, unlink } from 'fs/promises';
import { dirname } from 'path';
import { Transform, type Readable } from 'stream';
import { pipeline } from 'stream/promises';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  ERROR_CODES,
  EXTERNAL_MEDIA_TARGET,
  FILE_TYPES,
} from '@vault/common/constants';
import {
  MEDIA_JOB_KINDS,
  MEDIA_JOB_STATUSES,
  MEDIA_PROVIDER_DEFS,
  MEDIA_SKIP_REASONS,
  MEDIA_THUMB_STATUSES,
  MEDIA_UPLOAD_SLOTS,
  MEDIA_VIDEO_STATUSES,
  type MediaClaimedJob,
  type MediaClaimRequest,
  type MediaCompleteRequest,
  type MediaFailRequest,
  type MediaJobKind,
  type MediaProgressRequest,
  type MediaSkipRequest,
  type MediaUploadSlot,
} from '@vault/common/media';
import type { DataSource, EntityManager, Repository } from 'typeorm';

import { getMediaCacheConfig, getUploadsConfig } from '../../config/env';
import { File } from '../../entities/file.entity';
import { ExternalMedia, MediaJob } from '../../entities/media.entity';
import { VaultException } from '../../globals/exceptions';
import { resolveUploadPath } from '../upload/upload.paths';

import {
  MEDIA_INCOMING_DIR,
  mediaThumbPath,
  mediaVideoPath,
} from './media.paths';
import { LEASE_MS, retryDelayMs } from './media.rules';

/** Covers are a few hundred KB; anything far larger is not one. */
const MAX_THUMB_BYTES = 5 * 1024 * 1024;

/** How often a streaming upload renews its job's lease. */
const LEASE_RENEW_MS = 60_000;

/** Room for container overhead beyond the size the fetcher aimed for. */
const VIDEO_SLACK = 1.1;

const SLOT_MIMES: Record<MediaUploadSlot, string> = {
  [MEDIA_UPLOAD_SLOTS.VIDEO]: 'video/mp4',
  [MEDIA_UPLOAD_SLOTS.THUMBNAIL]: 'image/jpeg',
};

/** Jobs a fetcher may hold the lease of but no longer find usable. */
const MAX_CLAIM_ATTEMPTS = 5;

/** Uploaded files waiting for their job to complete, by slot. */
type Uploads = Partial<Record<MediaUploadSlot, string>>;

const conflict = () =>
  new VaultException(ERROR_CODES.IncorrectData, HttpStatus.CONFLICT);

const badRequest = () =>
  new VaultException(ERROR_CODES.IncorrectData, HttpStatus.BAD_REQUEST);

const isOneOf = <T extends string>(
  values: Record<string, T>,
  value: unknown,
): value is T => (Object.values(values) as unknown[]).includes(value);

/**
 * Hands media jobs to fetchers and takes their results.
 *
 * A claimed job is leased to one fetcher; only that fetcher may report on it,
 * and only while it is running. A lease that runs out counts as a retryable
 * failure, so a crashed fetcher's work is picked up again.
 */
@Injectable()
export class MediaJobsService {
  private readonly logger = new Logger('MediaJobs');

  /**
   * Each fetcher's yt-dlp version and last request of any kind, since this
   * process started. Busy fetchers report every minute; idle ones ask for work
   * every `IDLE_POLL_SEC`.
   */
  readonly fetchers = new Map<string, { version: string; lastSeenAt: Date }>();

  /** Records that `fetcher` was heard from; every authenticated request counts. */
  noteSeen(fetcher: string, ytDlpVersion?: string): void {
    this.fetchers.set(fetcher, {
      version: ytDlpVersion
        ? String(ytDlpVersion).slice(0, 64)
        : (this.fetchers.get(fetcher)?.version ?? ''),
      lastSeenAt: new Date(),
    });
  }

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(MediaJob) private readonly jobs: Repository<MediaJob>,
    @InjectRepository(ExternalMedia)
    private readonly media: Repository<ExternalMedia>,
    @InjectRepository(File) private readonly files: Repository<File>,
  ) {}

  // ---------------------------------------------------------------- claim

  async claim(
    fetcher: string,
    request: MediaClaimRequest,
  ): Promise<MediaClaimedJob | null> {
    const kinds = Array.isArray(request?.kinds) ? request.kinds : [];

    if (
      kinds.length === 0 ||
      !kinds.every((kind) => isOneOf(MEDIA_JOB_KINDS, kind))
    ) {
      throw badRequest();
    }

    this.noteSeen(fetcher, request.ytDlpVersion);

    if (!getMediaCacheConfig().enabled) {
      return null;
    }

    await this.expireLeases();

    for (let attempt = 0; attempt < MAX_CLAIM_ATTEMPTS; attempt += 1) {
      const job = await this.dataSource.transaction((manager) =>
        this.takeNext(manager, fetcher, kinds),
      );

      if (!job) {
        return null;
      }

      const claimed = await this.describe(job);

      if (claimed) {
        return claimed;
      }
    }

    return null;
  }

  /** Locks the most urgent due job of `kinds` and leases it to `fetcher`. */
  private async takeNext(
    manager: EntityManager,
    fetcher: string,
    kinds: MediaJobKind[],
  ): Promise<MediaJob | null> {
    const now = new Date();
    const [row] = (await manager.query(
      `SELECT id FROM media_job
        WHERE status = ? AND kind IN (?)
          AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
        ORDER BY priority, id
        LIMIT 1
        FOR UPDATE SKIP LOCKED`,
      [MEDIA_JOB_STATUSES.QUEUED, kinds, now],
    )) as Array<{ id: number }>;

    if (!row) {
      return null;
    }

    await manager.update(MediaJob, Number(row.id), {
      status: MEDIA_JOB_STATUSES.RUNNING,
      leaseOwner: fetcher,
      leaseUntil: new Date(now.getTime() + LEASE_MS),
      progress: 0,
    });

    return manager.findOneByOrFail(MediaJob, { id: Number(row.id) });
  }

  /**
   * The job as the fetcher sees it, marking its item as in progress. Null when
   * its item is gone or unusable, in which case the job is cancelled.
   */
  private async describe(job: MediaJob): Promise<MediaClaimedJob | null> {
    const item = job.mediaId
      ? await this.media.findOneBy({ id: job.mediaId })
      : null;
    const def = item ? MEDIA_PROVIDER_DEFS[item.provider] : undefined;

    if (!item || !def?.isValidId(item.externalId)) {
      await this.finish(job, MEDIA_JOB_STATUSES.CANCELLED);
      return null;
    }

    if (job.kind === MEDIA_JOB_KINDS.DOWNLOAD) {
      await this.media.update(item.id, {
        videoStatus: MEDIA_VIDEO_STATUSES.DOWNLOADING,
      });
    }

    const { maxDurationSec, maxBytes, qualityTiers } = getMediaCacheConfig();

    return {
      id: job.id,
      kind: job.kind,
      provider: item.provider,
      externalId: item.externalId,
      url: def.canonicalUrl(item.externalId),
      constraints: { maxDurationSec, maxBytes, qualityTiers },
      attempt: job.attempts + 1,
      leaseUntil: (job.leaseUntil ?? new Date()).toISOString(),
    };
  }

  /** Running jobs whose fetcher stopped reporting count as retryable failures. */
  async expireLeases(): Promise<void> {
    const expired = await this.jobs
      .createQueryBuilder('job')
      .where('job.status = :status', { status: MEDIA_JOB_STATUSES.RUNNING })
      .andWhere('job.lease_until < :now', { now: new Date() })
      .getMany();

    for (const job of expired) {
      this.logger.warn(`job ${job.id} lost its lease (${job.leaseOwner})`);
      await this.retryLater(job, 'lease expired');
    }
  }

  // -------------------------------------------------------------- reports

  async progress(
    fetcher: string,
    jobId: number,
    request: MediaProgressRequest,
  ): Promise<void> {
    const job = await this.leased(fetcher, jobId);
    const percent = Number(request?.percent);

    if (!Number.isFinite(percent)) {
      throw badRequest();
    }

    await this.jobs.update(job.id, {
      progress: Math.max(0, Math.min(100, Math.round(percent))),
      leaseUntil: new Date(Date.now() + LEASE_MS),
    });
  }

  /**
   * Streams an uploaded file to a temporary place. It is moved into place only
   * when the job completes, so a failed job never replaces a good copy.
   */
  async upload(
    fetcher: string,
    jobId: number,
    slot: string,
    body: Readable,
    headers: { contentType?: string; contentLength?: string; sha256?: string },
  ): Promise<void> {
    const job = await this.leased(fetcher, jobId);

    if (
      job.kind !== MEDIA_JOB_KINDS.DOWNLOAD ||
      !isOneOf(MEDIA_UPLOAD_SLOTS, slot)
    ) {
      throw badRequest();
    }

    const mime = (headers.contentType ?? '').split(';')[0].trim();
    const expectedHash = (headers.sha256 ?? '').trim().toLowerCase();

    if (mime !== SLOT_MIMES[slot] || !/^[0-9a-f]{64}$/.test(expectedHash)) {
      throw badRequest();
    }

    const limit =
      slot === MEDIA_UPLOAD_SLOTS.VIDEO
        ? Math.round(getMediaCacheConfig().maxBytes * VIDEO_SLACK)
        : MAX_THUMB_BYTES;

    if (Number(headers.contentLength ?? 0) > limit) {
      throw new VaultException(
        ERROR_CODES.FilesIsTooBig,
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    const relative = `${MEDIA_INCOMING_DIR}/${job.id}-${slot}-${randomBytes(6).toString('hex')}`;
    const absolute = this.absolute(relative);
    const hash = createHash('sha256');
    const renew = () => this.renewLease(job.id, fetcher);
    let size = 0;
    let renewedAt = Date.now();

    await mkdir(dirname(absolute), { recursive: true });

    try {
      await pipeline(
        body,
        new Transform({
          transform(chunk: Buffer, _encoding, done) {
            size += chunk.length;

            if (size > limit) {
              done(new UploadTooBig());
              return;
            }

            hash.update(chunk);

            // A long upload keeps its lease; one that lost it stops here.
            if (Date.now() - renewedAt < LEASE_RENEW_MS) {
              done(null, chunk);
              return;
            }

            renewedAt = Date.now();
            renew().then(
              (held) => (held ? done(null, chunk) : done(new LeaseLost())),
              (error: Error) => done(error),
            );
          },
        }),
        createWriteStream(absolute),
      );
    } catch (error) {
      await unlink(absolute).catch((): void => undefined);

      if (error instanceof UploadTooBig) {
        throw new VaultException(
          ERROR_CODES.FilesIsTooBig,
          HttpStatus.PAYLOAD_TOO_LARGE,
        );
      }

      if (error instanceof LeaseLost) {
        throw conflict();
      }

      throw error;
    }

    if (size === 0 || hash.digest('hex') !== expectedHash) {
      await unlink(absolute).catch((): void => undefined);
      throw badRequest();
    }

    // Recorded only if the lease is still this fetcher's: the job may have
    // been handed to someone else while the body streamed.
    const current = await this.jobs.findOneBy({ id: job.id });
    const uploads = current ? this.uploadsOf(current) : {};
    const recorded = await this.jobs.update(
      {
        id: job.id,
        status: MEDIA_JOB_STATUSES.RUNNING,
        leaseOwner: fetcher,
      },
      {
        payload: {
          ...current?.payload,
          uploads: { ...uploads, [slot]: relative },
        },
        leaseUntil: new Date(Date.now() + LEASE_MS),
      },
    );

    if (!recorded.affected) {
      await unlink(absolute).catch((): void => undefined);
      throw conflict();
    }

    await this.discard({ [slot]: uploads[slot] });
  }

  /** Extends the lease if `fetcher` still holds it; false when it does not. */
  private async renewLease(jobId: number, fetcher: string): Promise<boolean> {
    const result = await this.jobs.update(
      { id: jobId, status: MEDIA_JOB_STATUSES.RUNNING, leaseOwner: fetcher },
      { leaseUntil: new Date(Date.now() + LEASE_MS) },
    );

    return !!result.affected;
  }

  /** Moves the uploads into place and marks the item ready. */
  async complete(
    fetcher: string,
    jobId: number,
    request: MediaCompleteRequest,
  ): Promise<void> {
    const job = await this.leased(fetcher, jobId);
    const item = job.mediaId
      ? await this.media.findOneBy({ id: job.mediaId })
      : null;
    const uploads = this.uploadsOf(job);

    if (!item || !uploads.video) {
      throw badRequest();
    }

    const videoPath = mediaVideoPath(item.provider, item.externalId);
    const size = await this.moveIntoPlace(uploads.video, videoPath);
    const facts = this.videoFacts(request);
    const fileId = await this.saveVideoFile(item, videoPath, size, facts);

    const update: Partial<ExternalMedia> = {
      videoStatus: MEDIA_VIDEO_STATUSES.READY,
      skipReason: null,
      videoFileId: fileId,
      duration: facts.duration ?? item.duration,
      width: facts.width ?? item.width,
      height: facts.height ?? item.height,
    };

    if (uploads.thumbnail) {
      const thumbPath = mediaThumbPath(item.provider, item.externalId);

      if (item.thumbStatus === MEDIA_THUMB_STATUSES.READY) {
        await this.discard({ thumbnail: uploads.thumbnail });
      } else {
        await this.moveIntoPlace(uploads.thumbnail, thumbPath);
        update.thumbStatus = MEDIA_THUMB_STATUSES.READY;
        update.thumbPath = thumbPath;
      }
    }

    await this.media.update(item.id, update);
    await this.finish(job, MEDIA_JOB_STATUSES.DONE, {
      progress: 100,
      lastError: null,
    });
  }

  async fail(
    fetcher: string,
    jobId: number,
    request: MediaFailRequest,
  ): Promise<void> {
    const job = await this.leased(fetcher, jobId);
    const reason = String(request?.reason ?? '').slice(0, 2000) || 'unknown';

    if (request?.retryable) {
      await this.retryLater(job, reason);
      return;
    }

    await this.discard(this.uploadsOf(job));

    if (job.mediaId && job.kind === MEDIA_JOB_KINDS.DOWNLOAD) {
      await this.media.update(job.mediaId, {
        videoStatus: MEDIA_VIDEO_STATUSES.UNAVAILABLE,
      });
    }

    await this.finish(job, MEDIA_JOB_STATUSES.FAILED, { lastError: reason });
  }

  async skip(
    fetcher: string,
    jobId: number,
    request: MediaSkipRequest,
  ): Promise<void> {
    const job = await this.leased(fetcher, jobId);

    if (!isOneOf(MEDIA_SKIP_REASONS, request?.reason)) {
      throw badRequest();
    }

    await this.discard(this.uploadsOf(job));

    if (job.mediaId) {
      const duration = Number(request.duration);
      const estimatedBytes = Number(request.estimatedBytes);

      await this.media.update(job.mediaId, {
        videoStatus: MEDIA_VIDEO_STATUSES.SKIPPED,
        skipReason: request.reason,
        ...(duration > 0 ? { duration: Math.round(duration) } : {}),
        ...(estimatedBytes > 0
          ? { estimatedBytes: Math.round(estimatedBytes) }
          : {}),
      });
    }

    await this.finish(job, MEDIA_JOB_STATUSES.DONE);
  }

  // -------------------------------------------------------------- helpers

  /** The job, if `fetcher` holds it and it is still running; otherwise 409. */
  private async leased(fetcher: string, jobId: number): Promise<MediaJob> {
    const job = Number.isInteger(jobId)
      ? await this.jobs.findOneBy({ id: jobId })
      : null;

    if (!job) {
      throw new VaultException(ERROR_CODES.IncorrectData, HttpStatus.NOT_FOUND);
    }

    if (
      job.status !== MEDIA_JOB_STATUSES.RUNNING ||
      job.leaseOwner !== fetcher
    ) {
      throw conflict();
    }

    return job;
  }

  /** Back to the queue after the wait its failure count calls for. */
  private async retryLater(job: MediaJob, reason: string): Promise<void> {
    const failures = job.attempts + 1;

    await this.discard(this.uploadsOf(job));

    await this.jobs.update(job.id, {
      status: MEDIA_JOB_STATUSES.QUEUED,
      attempts: failures,
      nextAttemptAt: new Date(Date.now() + retryDelayMs(failures)),
      lastError: reason,
      leaseOwner: null,
      leaseUntil: null,
      progress: 0,
      payload: { ...job.payload, uploads: {} },
    });

    if (job.mediaId && job.kind === MEDIA_JOB_KINDS.DOWNLOAD) {
      await this.media.update(job.mediaId, {
        videoStatus: MEDIA_VIDEO_STATUSES.FAILED,
      });
    }
  }

  private async finish(
    job: MediaJob,
    status: MediaJob['status'],
    extra: Partial<MediaJob> = {},
  ): Promise<void> {
    await this.jobs.update(job.id, {
      status,
      leaseOwner: null,
      leaseUntil: null,
      finishedAt: new Date(),
      payload: { ...job.payload, uploads: {} },
      ...extra,
    });
  }

  private uploadsOf(job: MediaJob): Uploads {
    return ((job.payload ?? {}).uploads ?? {}) as Uploads;
  }

  private async discard(uploads: Uploads): Promise<void> {
    for (const relative of Object.values(uploads)) {
      if (relative) {
        await unlink(this.absolute(relative)).catch((): void => undefined);
      }
    }
  }

  /** Renames a finished upload over its final path; returns its size. */
  private async moveIntoPlace(from: string, to: string): Promise<number> {
    const target = this.absolute(to);

    await mkdir(dirname(target), { recursive: true });
    await rename(this.absolute(from), target);

    return (await stat(target)).size;
  }

  private videoFacts(request: MediaCompleteRequest) {
    const positive = (value: unknown) => {
      const number = Math.round(Number(value));
      return Number.isFinite(number) && number > 0 ? number : undefined;
    };

    return {
      duration: positive(request?.video?.duration),
      width: positive(request?.video?.width),
      height: positive(request?.video?.height),
    };
  }

  /** Creates the copy's `file` row, or refreshes the one it already has. */
  private async saveVideoFile(
    item: ExternalMedia,
    path: string,
    size: number,
    facts: { duration?: number; width?: number; height?: number },
  ): Promise<number> {
    const name = path.slice(path.lastIndexOf('/') + 1);
    const fields: Partial<File> = {
      name,
      origName: name,
      path: path.slice(0, path.lastIndexOf('/')),
      fullPath: path,
      url: `REMOTE_CURRENT://${path}`,
      size,
      type: FILE_TYPES.VIDEO,
      mime: SLOT_MIMES.video,
      metadata: facts,
      target: EXTERNAL_MEDIA_TARGET,
      deletedAt: null,
    };

    if (item.videoFileId) {
      const existing = await this.files.findOneBy({ id: item.videoFileId });

      if (existing) {
        await this.files.update(existing.id, fields);
        return existing.id;
      }
    }

    const saved = await this.files.save(
      this.files.create({ ...fields, userId: null }),
    );

    return saved.id;
  }

  private absolute(relative: string): string {
    const root = getUploadsConfig().path;
    const absolute = resolveUploadPath(root, relative);

    if (!absolute) {
      throw new VaultException(
        ERROR_CODES.UnexpectedBehavior,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return absolute;
  }
}

class UploadTooBig extends Error {}

class LeaseLost extends Error {}
