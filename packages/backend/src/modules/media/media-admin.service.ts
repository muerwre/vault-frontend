import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ERROR_CODES } from '@vault/common/constants';
import {
  type IMediaAdminJob,
  type IMediaAdminJobList,
  type IMediaAdminSummary,
  MEDIA_ADMIN_JOB_FILTERS,
  MEDIA_JOB_KINDS,
  MEDIA_JOB_STATUSES,
  MEDIA_PRIORITIES,
  MEDIA_VIDEO_STATUSES,
  type MediaAdminJobFilter,
  describeMediaQualityTiers,
} from '@vault/common/media';
import { In, type DataSource, type Repository } from 'typeorm';

import {
  getMediaBacklogConfig,
  getMediaCacheConfig,
  getMediaCleanupConfig,
  getMediaFetcherKeys,
  getMediaRescanCron,
  getScheduleTimeZone,
} from '../../config/env';
import { ExternalMedia, MediaJob } from '../../entities/media.entity';
import { VaultException } from '../../globals/exceptions';

import { parseFetcherKeys } from './fetcher-keys';
import { MediaJobsService } from './media-jobs.service';

const MAX_TAKE = 100;

const iso = (date: Date | null | undefined): string | null =>
  date ? date.toISOString() : null;

const countBy = (rows: Array<{ key: string; count: string | number }>) =>
  Object.fromEntries(rows.map((row) => [row.key, Number(row.count)]));

/** What the admin page shows about the media cache, and what it may change. */
@Injectable()
export class MediaAdminService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(MediaJob) private readonly jobs: Repository<MediaJob>,
    @InjectRepository(ExternalMedia)
    private readonly media: Repository<ExternalMedia>,
    private readonly mediaJobs: MediaJobsService,
  ) {}

  async summary(): Promise<IMediaAdminSummary> {
    const query = <T>(sql: string, params: unknown[] = []) =>
      this.dataSource.query(sql, params) as Promise<T>;

    const [items, thumbs, backlog, jobs, retrying, storage] = await Promise.all(
      [
        query<Array<{ key: string; count: string }>>(
          'SELECT video_status AS `key`, COUNT(*) AS count FROM external_media GROUP BY video_status',
        ),
        query<Array<{ key: string; count: string }>>(
          'SELECT thumb_status AS `key`, COUNT(*) AS count FROM external_media GROUP BY thumb_status',
        ),
        query<Array<{ count: string }>>(
          'SELECT COUNT(*) AS count FROM external_media WHERE video_status = ? AND priority > ?',
          [MEDIA_VIDEO_STATUSES.NONE, MEDIA_PRIORITIES.FRESH],
        ),
        query<Array<{ kind: string; status: string; count: string }>>(
          'SELECT kind, status, COUNT(*) AS count FROM media_job GROUP BY kind, status ORDER BY kind, status',
        ),
        query<Array<{ count: string }>>(
          'SELECT COUNT(*) AS count FROM media_job WHERE status = ? AND attempts > 0',
          [MEDIA_JOB_STATUSES.QUEUED],
        ),
        query<Array<{ files: string; bytes: string | null }>>(
          `SELECT COUNT(*) AS files, SUM(f.size) AS bytes
           FROM external_media m JOIN file f ON f.id = m.video_file_id
          WHERE f.deleted_at IS NULL`,
        ),
      ],
    );

    const cache = getMediaCacheConfig();
    const backlogConfig = getMediaBacklogConfig();
    const cleanup = getMediaCleanupConfig();

    return {
      enabled: cache.enabled,
      items: countBy(items),
      thumbs: countBy(thumbs),
      backlog_waiting: Number(backlog[0]?.count ?? 0),
      jobs: jobs.map((row) => ({
        kind: row.kind as IMediaAdminSummary['jobs'][number]['kind'],
        status: row.status as IMediaAdminSummary['jobs'][number]['status'],
        count: Number(row.count),
      })),
      retrying: Number(retrying[0]?.count ?? 0),
      storage: {
        files: Number(storage[0]?.files ?? 0),
        bytes: Number(storage[0]?.bytes ?? 0),
      },
      fetchers: [...this.mediaJobs.fetchers.entries()]
        .map(([name, seen]) => ({
          name,
          yt_dlp_version: seen.version,
          last_seen_at: seen.lastSeenAt.toISOString(),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      settings: {
        fetcher_keys: parseFetcherKeys(getMediaFetcherKeys()).length,
        quality_tiers: describeMediaQualityTiers(cache.qualityTiers),
        max_duration_sec: cache.maxDurationSec,
        max_mb: Math.round(cache.maxBytes / 1024 / 1024),
        backlog_batch: backlogConfig.batch,
        backlog_cron: backlogConfig.cron,
        rescan_cron: getMediaRescanCron(),
        cleanup_cron: cleanup.cron,
        grace_days: cleanup.graceDays,
        time_zone: getScheduleTimeZone(),
      },
    };
  }

  /** Jobs matching `filter`, most recently changed first. */
  async listJobs(
    filter: string | undefined,
    take: number,
    skip: number,
  ): Promise<IMediaAdminJobList> {
    const wanted = (filter || 'failed') as MediaAdminJobFilter;

    if (!MEDIA_ADMIN_JOB_FILTERS.includes(wanted)) {
      throw new VaultException(ERROR_CODES.IncorrectData);
    }

    const builder = this.jobs.createQueryBuilder('job');

    if (wanted === 'retrying') {
      builder
        .where('job.status = :status', { status: MEDIA_JOB_STATUSES.QUEUED })
        .andWhere('job.attempts > 0');
    } else {
      builder.where('job.status = :status', { status: wanted });
    }

    const [rows, total] = await builder
      .orderBy('job.updated_at', 'DESC')
      .addOrderBy('job.id', 'DESC')
      .take(Math.min(Math.max(take || 50, 1), MAX_TAKE))
      .skip(Math.max(skip || 0, 0))
      .getManyAndCount();

    const items = await this.media.findBy({
      id: In(rows.map((row) => row.mediaId).filter((id): id is number => !!id)),
    });
    const byId = new Map(items.map((item) => [item.id, item]));

    return {
      total,
      jobs: rows.map((row) => this.toWire(row, byId.get(row.mediaId ?? 0))),
    };
  }

  /**
   * Puts a failed, waiting or cancelled job back at the front of its queue,
   * whatever its failure history. Refused (409) for a job a fetcher is working
   * on, a finished one, and one whose item already has its copy or was
   * removed: retrying those would hide a good copy or fetch an unlinked one.
   */
  async retry(jobId: number): Promise<void> {
    const job = await this.jobs.findOneBy({ id: jobId });

    if (!job) {
      throw new VaultException(ERROR_CODES.IncorrectData, HttpStatus.NOT_FOUND);
    }

    const item = job.mediaId
      ? await this.media.findOneBy({ id: job.mediaId })
      : null;

    if (
      job.status === MEDIA_JOB_STATUSES.RUNNING ||
      job.status === MEDIA_JOB_STATUSES.DONE ||
      item?.videoStatus === MEDIA_VIDEO_STATUSES.READY ||
      item?.videoStatus === MEDIA_VIDEO_STATUSES.REMOVED
    ) {
      throw new VaultException(ERROR_CODES.IncorrectData, HttpStatus.CONFLICT);
    }

    await this.jobs.update(job.id, {
      status: MEDIA_JOB_STATUSES.QUEUED,
      nextAttemptAt: null,
      leaseOwner: null,
      leaseUntil: null,
      finishedAt: null,
      progress: 0,
    });

    if (job.mediaId && job.kind === MEDIA_JOB_KINDS.DOWNLOAD) {
      await this.media.update(job.mediaId, {
        videoStatus: MEDIA_VIDEO_STATUSES.QUEUED,
        skipReason: null,
      });
    }
  }

  private toWire(job: MediaJob, item?: ExternalMedia): IMediaAdminJob {
    return {
      id: job.id,
      kind: job.kind,
      status: job.status,
      priority: job.priority,
      progress: job.progress,
      attempts: job.attempts,
      next_attempt_at: iso(job.nextAttemptAt),
      last_error: job.lastError,
      lease_owner: job.leaseOwner,
      updated_at: iso(job.updatedAt) ?? '',
      finished_at: iso(job.finishedAt),
      media: item
        ? {
            provider: item.provider,
            external_id: item.externalId,
            video_status: item.videoStatus,
            skip_reason: item.skipReason,
            duration: item.duration,
          }
        : null,
    };
  }
}
