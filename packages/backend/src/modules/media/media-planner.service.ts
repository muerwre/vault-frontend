import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MEDIA_JOB_KINDS,
  MEDIA_JOB_STATUSES,
  MEDIA_KINDS,
  MEDIA_PROVIDERS,
  MEDIA_THUMB_STATUSES,
  MEDIA_VIDEO_STATUSES,
  type MediaJobKind,
} from '@vault/common/media';
import { In, Repository } from 'typeorm';

import {
  getMediaCacheConfig,
  isYoutubeThumbCacheEnabled,
} from '../../config/env';
import { ExternalMedia, MediaJob } from '../../entities/media.entity';
import { YoutubeService, type YoutubeDetails } from '../meta/youtube.service';
import { youtubeThumbPath } from '../upload/upload.paths';
import { YoutubeThumbService } from '../upload/youtube-thumb.service';

import { decideVideo, type VideoFacts } from './media.rules';

/** How often new items are looked for. */
const POLL_MS = 15_000;

/** Items planned per round; also the YouTube API's ids-per-call limit. */
const BATCH_SIZE = 50;

/**
 * Decides what happens to newly linked items: fetches what the provider says
 * about them, stores their thumbnails, and queues downloads for the ones worth
 * keeping. Picks up items in `none`, most urgent first.
 */
@Injectable()
export class MediaPlannerService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger('MediaPlanner');

  private timer?: NodeJS.Timeout;

  private current?: Promise<void>;

  private stopping = false;

  constructor(
    @InjectRepository(ExternalMedia)
    private readonly media: Repository<ExternalMedia>,
    @InjectRepository(MediaJob) private readonly jobs: Repository<MediaJob>,
    private readonly youtube: YoutubeService,
    private readonly youtubeThumbs: YoutubeThumbService,
  ) {}

  onApplicationBootstrap(): void {
    if (!getMediaCacheConfig().enabled) {
      return;
    }

    void this.runOnce();

    this.timer = setInterval(() => void this.runOnce(), POLL_MS);
    this.timer.unref();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }

    this.stopping = true;

    try {
      await this.current;
    } finally {
      this.stopping = false;
    }
  }

  /** Plans everything waiting. Concurrent calls share the run in progress. */
  runOnce(): Promise<void> {
    this.current ??= this.drain().finally(() => {
      this.current = undefined;
    });

    return this.current;
  }

  private async drain(): Promise<void> {
    try {
      while (!this.stopping) {
        const batch = await this.media.find({
          where: { videoStatus: MEDIA_VIDEO_STATUSES.NONE },
          order: { priority: 'ASC', id: 'ASC' },
          take: BATCH_SIZE,
        });

        if (batch.length === 0 || !(await this.plan(batch))) {
          return;
        }
      }
    } catch (error) {
      this.logger.error(
        `planning failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /** False when the batch could not be planned and should wait for a later round. */
  private async plan(batch: ExternalMedia[]): Promise<boolean> {
    const youtube = batch.filter(
      (item) => item.provider === MEDIA_PROVIDERS.YOUTUBE,
    );
    const others = batch.filter(
      (item) => item.provider !== MEDIA_PROVIDERS.YOUTUBE,
    );

    for (const item of others) {
      await this.planWithProbe(item);
    }

    return youtube.length === 0 || this.planYoutube(youtube);
  }

  /**
   * YouTube is described by its Data API, cheaply and without the fetcher;
   * without an API key, durations are left to the fetcher's own check.
   */
  private async planYoutube(items: ExternalMedia[]): Promise<boolean> {
    let details: Map<string, YoutubeDetails> | null = null;

    if (this.youtube.isConfigured) {
      try {
        details = await this.youtube.fetchDetails(
          items.map((item) => item.externalId),
        );
      } catch (error) {
        this.logger.warn(
          `youtube details unavailable, retrying later: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        return false;
      }
    }

    const { maxDurationSec } = getMediaCacheConfig();

    for (const item of items) {
      const facts: VideoFacts | undefined = details
        ? details.get(item.externalId)
        : { duration: null, isLive: false };
      const decision = decideVideo(facts, { maxDurationSec });

      item.kind = MEDIA_KINDS.VIDEO;
      item.duration = facts?.duration ?? null;
      item.videoStatus = decision.status;
      item.skipReason = 'reason' in decision ? decision.reason : null;
    }

    await this.storeYoutubeThumbs(
      items.filter(
        (item) => item.videoStatus !== MEDIA_VIDEO_STATUSES.UNAVAILABLE,
      ),
    );

    for (const item of items) {
      await this.media.save(item);

      if (item.videoStatus === MEDIA_VIDEO_STATUSES.QUEUED) {
        await this.enqueue(MEDIA_JOB_KINDS.DOWNLOAD, item);
      }
    }

    return true;
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
