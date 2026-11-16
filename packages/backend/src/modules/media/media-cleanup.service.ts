import { readdir, stat, unlink } from 'fs/promises';

import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  MEDIA_JOB_STATUSES,
  MEDIA_OWNER_TYPES,
  MEDIA_PROVIDERS,
  MEDIA_THUMB_STATUSES,
  MEDIA_VIDEO_STATUSES,
} from '@vault/common/media';
import { CronJob } from 'cron';
import { In, IsNull, type DataSource, type Repository } from 'typeorm';

import {
  getMediaCacheConfig,
  getMediaCleanupConfig,
  getScheduleTimeZone,
  getUploadsConfig,
  isYoutubeThumbCacheEnabled,
} from '../../config/env';
import { File } from '../../entities/file.entity';
import { ExternalMedia, MediaJob } from '../../entities/media.entity';
import { resolveUploadPath, youtubeThumbPath } from '../upload/upload.paths';
import { YoutubeThumbService } from '../upload/youtube-thumb.service';

import { MEDIA_INCOMING_DIR } from './media.paths';

const CLEANUP_JOB = 'media-cleanup';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Items removed per run; the rest wait for the next one. */
const REMOVE_BATCH = 500;

/** Failed covers tried again per run. */
const THUMB_RETRY_BATCH = 100;

/** Uploads this old belong to no job that can still complete. */
const INCOMING_MAX_AGE_MS = DAY_MS;

export interface CleanupReport {
  /** Links whose node or comment no longer exists at all. */
  linksDropped: number;
  /** Items nothing live links any more, with their files deleted. */
  removed: number;
  /** Abandoned uploads deleted. */
  incomingDeleted: number;
  thumbsRetried: number;
  thumbsRecovered: number;
}

/**
 * Nightly upkeep of the local copies: deletes what nothing links any more,
 * clears abandoned uploads, and tries failed covers again.
 *
 * A link from a deleted node or comment still counts for a grace period, since
 * deletion can be undone. A comment counts only while its node does too.
 */
@Injectable()
export class MediaCleanupService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger('MediaCleanup');

  private current?: Promise<CleanupReport>;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(ExternalMedia)
    private readonly media: Repository<ExternalMedia>,
    @InjectRepository(MediaJob) private readonly jobs: Repository<MediaJob>,
    @InjectRepository(File) private readonly files: Repository<File>,
    private readonly youtubeThumbs: YoutubeThumbService,
    private readonly scheduler: SchedulerRegistry,
  ) {}

  onApplicationBootstrap(): void {
    if (getMediaCacheConfig().enabled) {
      this.schedule();
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.scheduler.doesExist('cron', CLEANUP_JOB)) {
      this.scheduler.deleteCronJob(CLEANUP_JOB);
    }

    await this.current;
  }

  /** One full run. A call while one is running shares it. */
  run(): Promise<CleanupReport> {
    this.current ??= this.cleanUp().finally(() => {
      this.current = undefined;
    });

    return this.current;
  }

  private schedule(): void {
    const { cron } = getMediaCleanupConfig();
    const timeZone = getScheduleTimeZone();

    try {
      const job = CronJob.from({
        cronTime: cron,
        timeZone,
        onTick: () => {
          if (getMediaCacheConfig().enabled) {
            void this.run();
          }
        },
      });

      this.scheduler.addCronJob(CLEANUP_JOB, job);
      job.start();
      this.logger.log(`cleaning up on "${cron}" (${timeZone})`);
    } catch (error) {
      this.logger.error(
        `cleanup not scheduled, "${cron}" in ${timeZone} is invalid: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async cleanUp(): Promise<CleanupReport> {
    const report: CleanupReport = {
      linksDropped: 0,
      removed: 0,
      incomingDeleted: 0,
      thumbsRetried: 0,
      thumbsRecovered: 0,
    };

    try {
      report.linksDropped = await this.dropLinksToMissingOwners();
      report.removed = await this.removeUnlinked();
      report.incomingDeleted = await this.clearIncoming();
      Object.assign(report, await this.retryThumbs());

      this.logger.log(
        `dropped ${report.linksDropped} dead links, removed ${report.removed} items, ` +
          `${report.incomingDeleted} stale uploads; covers ${report.thumbsRecovered}/${report.thumbsRetried} recovered`,
      );
    } catch (error) {
      this.logger.error(
        `cleanup failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return report;
  }

  /** Links to nodes and comments that were erased rather than deleted. */
  private async dropLinksToMissingOwners(): Promise<number> {
    let dropped = 0;

    for (const [ownerType, table] of [
      [MEDIA_OWNER_TYPES.NODE, 'node'],
      [MEDIA_OWNER_TYPES.COMMENT, 'comment'],
    ] as const) {
      const result = (await this.dataSource.query(
        `DELETE r FROM external_media_ref r
           LEFT JOIN \`${table}\` o ON o.id = r.owner_id
          WHERE r.owner_type = ? AND o.id IS NULL`,
        [ownerType],
      )) as { affectedRows?: number };

      dropped += result.affectedRows ?? 0;
    }

    return dropped;
  }

  /** Items with no live link: files deleted, open work cancelled. */
  private async removeUnlinked(): Promise<number> {
    const cutoff = new Date(
      Date.now() - getMediaCleanupConfig().graceDays * DAY_MS,
    );

    const rows = (await this.dataSource.query(
      `SELECT m.id FROM external_media m
        WHERE m.video_status <> ?
          AND NOT EXISTS (
            SELECT 1 FROM external_media_ref r
              LEFT JOIN node n
                ON r.owner_type = ? AND n.id = r.owner_id
              LEFT JOIN comment c
                ON r.owner_type = ? AND c.id = r.owner_id
              LEFT JOIN node cn ON cn.id = c.nodeId
             WHERE r.media_id = m.id
               AND (
                 (n.id IS NOT NULL AND (n.deleted_at IS NULL OR n.deleted_at > ?))
                 OR (
                   c.id IS NOT NULL
                   AND (c.deleted_at IS NULL OR c.deleted_at > ?)
                   AND cn.id IS NOT NULL
                   AND (cn.deleted_at IS NULL OR cn.deleted_at > ?)
                 )
               )
          )
        ORDER BY m.id
        LIMIT ?`,
      [
        MEDIA_VIDEO_STATUSES.REMOVED,
        MEDIA_OWNER_TYPES.NODE,
        MEDIA_OWNER_TYPES.COMMENT,
        cutoff,
        cutoff,
        cutoff,
        REMOVE_BATCH,
      ],
    )) as Array<{ id: number }>;

    const items = await this.media.findBy({
      id: In(rows.map((row) => Number(row.id))),
    });

    for (const item of items) {
      await this.remove(item);
    }

    return items.length;
  }

  private async remove(item: ExternalMedia): Promise<void> {
    if (item.videoFileId) {
      const file = await this.files.findOneBy({
        id: item.videoFileId,
        deletedAt: IsNull(),
      });

      if (file) {
        await this.deleteUpload(file.fullPath);
        await this.files.update(file.id, { deletedAt: new Date() });
      }
    }

    if (item.thumbPath) {
      await this.deleteUpload(item.thumbPath);
    }

    await this.jobs.update(
      {
        mediaId: item.id,
        status: In([MEDIA_JOB_STATUSES.QUEUED, MEDIA_JOB_STATUSES.RUNNING]),
      },
      {
        status: MEDIA_JOB_STATUSES.CANCELLED,
        leaseOwner: null,
        leaseUntil: null,
        finishedAt: new Date(),
      },
    );

    await this.media.update(item.id, {
      videoStatus: MEDIA_VIDEO_STATUSES.REMOVED,
      videoFileId: null,
      skipReason: null,
      thumbStatus: MEDIA_THUMB_STATUSES.NONE,
      thumbPath: null,
    });
  }

  /** Uploads left behind by jobs that never completed. */
  private async clearIncoming(): Promise<number> {
    const dir = this.absolute(MEDIA_INCOMING_DIR);

    if (!dir) {
      return 0;
    }

    const names = await readdir(dir).catch((): string[] => []);
    const tooOld = Date.now() - INCOMING_MAX_AGE_MS;
    let deleted = 0;

    for (const name of names) {
      const path = `${dir}/${name}`;
      const info = await stat(path).catch((): null => null);

      if (info?.isFile() && info.mtimeMs < tooOld) {
        await unlink(path).catch((): void => undefined);
        deleted += 1;
      }
    }

    return deleted;
  }

  private async retryThumbs(): Promise<
    Pick<CleanupReport, 'thumbsRetried' | 'thumbsRecovered'>
  > {
    if (!isYoutubeThumbCacheEnabled()) {
      return { thumbsRetried: 0, thumbsRecovered: 0 };
    }

    const failed = await this.media
      .createQueryBuilder('media')
      .where('media.thumb_status = :failed', {
        failed: MEDIA_THUMB_STATUSES.FAILED,
      })
      .andWhere('media.provider = :youtube', {
        youtube: MEDIA_PROVIDERS.YOUTUBE,
      })
      .andWhere('media.video_status <> :removed', {
        removed: MEDIA_VIDEO_STATUSES.REMOVED,
      })
      .orderBy('media.id', 'ASC')
      .take(THUMB_RETRY_BATCH)
      .getMany();

    let recovered = 0;

    for (const item of failed) {
      if (await this.youtubeThumbs.ensure(item.externalId)) {
        recovered += 1;
        await this.media.update(item.id, {
          thumbStatus: MEDIA_THUMB_STATUSES.READY,
          thumbPath: youtubeThumbPath(item.externalId),
        });
      }
    }

    return { thumbsRetried: failed.length, thumbsRecovered: recovered };
  }

  private async deleteUpload(relative: string): Promise<void> {
    const absolute = this.absolute(relative);

    if (absolute) {
      await unlink(absolute).catch((): void => undefined);
    }
  }

  private absolute(relative: string): string | null {
    return resolveUploadPath(getUploadsConfig().path, relative);
  }
}
