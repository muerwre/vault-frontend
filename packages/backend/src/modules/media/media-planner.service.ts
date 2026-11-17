import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MEDIA_JOB_KINDS,
  MEDIA_JOB_STATUSES,
  MEDIA_KINDS,
  MEDIA_OWNER_TYPES,
  MEDIA_PRIORITIES,
  MEDIA_PROVIDERS,
  MEDIA_THUMB_STATUSES,
  MEDIA_VIDEO_STATUSES,
  type MediaJobKind,
} from '@vault/common/media';
import { In, Repository } from 'typeorm';

import {
  getMediaBacklogConfig,
  getMediaCacheConfig,
  isYoutubeThumbCacheEnabled,
} from '../../config/env';
import { ExternalMedia, MediaJob } from '../../entities/media.entity';
import { youtubeThumbPath } from '../upload/upload.paths';
import { YoutubeThumbService } from '../upload/youtube-thumb.service';

import { scheduleMediaJob, unscheduleMediaJob } from './media-schedule';

/** How often fresh items are looked for. */
const POLL_MS = 15_000;

/** Items planned per round; also the YouTube API's ids-per-call limit. */
const BATCH_SIZE = 50;

const BACKLOG_JOB = 'media-backlog';

/**
 * Decides what happens to newly linked items: fetches what the provider says
 * about them, stores their thumbnails, and queues downloads for the ones worth
 * keeping.
 *
 * Fresh items are planned as soon as they appear. Items found in older content
 * wait in `none` and are released a batch at a time, newest content first. Planning
 * runs one round at a time, so an item is never planned twice at once.
 */
@Injectable()
export class MediaPlannerService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger('MediaPlanner');

  private timer?: NodeJS.Timeout;

  /** The fresh-items round in progress, shared by concurrent callers. */
  private current?: Promise<void>;

  /** Tail of the rounds queued so far; each waits for the previous one. */
  private lock: Promise<unknown> = Promise.resolve();

  private stopping = false;

  constructor(
    @InjectRepository(ExternalMedia)
    private readonly media: Repository<ExternalMedia>,
    @InjectRepository(MediaJob) private readonly jobs: Repository<MediaJob>,
    private readonly youtubeThumbs: YoutubeThumbService,
    private readonly scheduler: SchedulerRegistry,
  ) {}

  onApplicationBootstrap(): void {
    if (!getMediaCacheConfig().enabled) {
      return;
    }

    void this.runOnce();

    this.timer = setInterval(() => void this.runOnce(), POLL_MS);
    this.timer.unref();

    this.scheduleBacklog();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }

    unscheduleMediaJob(this.scheduler, BACKLOG_JOB);

    this.stopping = true;

    try {
      await this.lock;
    } finally {
      this.stopping = false;
    }
  }

  /** Plans every fresh item waiting. Concurrent calls share the run in progress. */
  runOnce(): Promise<void> {
    this.current ??= this.exclusive(() => this.drainFresh()).finally(() => {
      this.current = undefined;
    });

    return this.current;
  }

  /** Plans the next batch of backlog items, newest content first. */
  releaseBacklog(): Promise<void> {
    return this.exclusive(() => this.planBacklog());
  }

  private exclusive(task: () => Promise<void>): Promise<void> {
    const run = this.lock.then(task, task);
    this.lock = run.catch((): void => undefined);

    return run;
  }

  /** A bad expression is reported and leaves the backlog unreleased. */
  private scheduleBacklog(): void {
    const { cron, batch } = getMediaBacklogConfig();

    scheduleMediaJob({
      scheduler: this.scheduler,
      logger: this.logger,
      name: BACKLOG_JOB,
      cron,
      description: `releasing ${batch} backlog items`,
      onTick: () => {
        void this.releaseBacklog();
      },
    });
  }

  private async drainFresh(): Promise<void> {
    try {
      while (!this.stopping) {
        const batch = await this.media.find({
          where: {
            videoStatus: MEDIA_VIDEO_STATUSES.NONE,
            priority: MEDIA_PRIORITIES.FRESH,
          },
          order: { id: 'ASC' },
          take: BATCH_SIZE,
        });

        if (batch.length === 0) {
          return;
        }

        await this.plan(batch);
      }
    } catch (error) {
      this.logFailure(error);
    }
  }

  private async planBacklog(): Promise<void> {
    try {
      const ids = await this.newestBacklog(
        Math.min(getMediaBacklogConfig().batch, BATCH_SIZE),
      );

      if (ids.length === 0) {
        return;
      }

      // Planned, and so queued and claimed, in the query's order.
      const byId = new Map(
        (await this.media.findBy({ id: In(ids) })).map((item) => [
          item.id,
          item,
        ]),
      );

      await this.plan(
        ids
          .map((id) => byId.get(id))
          .filter((item): item is ExternalMedia => !!item),
      );
    } catch (error) {
      this.logFailure(error);
    }
  }

  /**
   * Waiting backlog items, those linked from the most recent content first:
   * what people see now is saved before what nobody has opened in years.
   * Nodes and comments count alike, by when they were posted.
   */
  private async newestBacklog(limit: number): Promise<number[]> {
    const rows = (await this.media.query(
      `SELECT m.id
         FROM external_media m
         JOIN external_media_ref r ON r.media_id = m.id
         LEFT JOIN node n ON r.owner_type = ? AND n.id = r.owner_id
         LEFT JOIN comment c ON r.owner_type = ? AND c.id = r.owner_id
        WHERE m.video_status = ? AND m.priority > ?
        GROUP BY m.id
        ORDER BY MAX(COALESCE(n.created_at, c.created_at)) DESC, m.id DESC
        LIMIT ?`,
      [
        MEDIA_OWNER_TYPES.NODE,
        MEDIA_OWNER_TYPES.COMMENT,
        MEDIA_VIDEO_STATUSES.NONE,
        MEDIA_PRIORITIES.FRESH,
        limit,
      ],
    )) as Array<{ id: number }>;

    return rows.map((row) => Number(row.id));
  }

  private logFailure(error: unknown): void {
    this.logger.error(
      `planning failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  private async plan(batch: ExternalMedia[]): Promise<void> {
    for (const item of batch) {
      if (item.provider !== MEDIA_PROVIDERS.YOUTUBE) {
        await this.planWithProbe(item);
      }
    }

    await this.planYoutube(
      batch.filter((item) => item.provider === MEDIA_PROVIDERS.YOUTUBE),
    );
  }

  /**
   * Every YouTube item is queued for download. Whether it still exists, is
   * live or is too long is checked by the fetcher before it downloads, so the
   * Data API is not spent on it.
   */
  private async planYoutube(items: ExternalMedia[]): Promise<void> {
    if (items.length === 0) {
      return;
    }

    for (const item of items) {
      item.kind = MEDIA_KINDS.VIDEO;
      item.videoStatus = MEDIA_VIDEO_STATUSES.QUEUED;
    }

    await this.storeYoutubeThumbs(items);

    for (const item of items) {
      await this.media.save(item);
      await this.enqueue(MEDIA_JOB_KINDS.DOWNLOAD, item);
    }
  }

  /** Covers come from public YouTube urls; the backend fetches them itself. */
  private async storeYoutubeThumbs(items: ExternalMedia[]): Promise<void> {
    if (!isYoutubeThumbCacheEnabled()) {
      return;
    }

    await Promise.all(
      items.map(async (item) => {
        const stored = await this.youtubeThumbs.ensure(item.externalId);

        item.thumbStatus = stored
          ? MEDIA_THUMB_STATUSES.READY
          : MEDIA_THUMB_STATUSES.FAILED;
        item.thumbPath = stored ? youtubeThumbPath(item.externalId) : null;
      }),
    );
  }

  /** Providers without an API of ours are described by the fetcher. */
  private async planWithProbe(item: ExternalMedia): Promise<void> {
    item.videoStatus = MEDIA_VIDEO_STATUSES.QUEUED;
    item.thumbStatus = MEDIA_THUMB_STATUSES.QUEUED;

    await this.media.save(item);
    await this.enqueue(MEDIA_JOB_KINDS.PROBE, item);
  }

  /** Queues `kind` for the item unless such work is already open. */
  private async enqueue(
    kind: MediaJobKind,
    item: ExternalMedia,
  ): Promise<void> {
    const open = await this.jobs.count({
      where: {
        kind,
        mediaId: item.id,
        status: In([MEDIA_JOB_STATUSES.QUEUED, MEDIA_JOB_STATUSES.RUNNING]),
      },
    });

    if (open > 0) {
      return;
    }

    await this.jobs.save(
      this.jobs.create({
        kind,
        mediaId: item.id,
        priority: item.priority,
        payload: {},
      }),
    );
  }
}
