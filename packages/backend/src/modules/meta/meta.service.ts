import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MEDIA_JOB_KINDS,
  MEDIA_JOB_STATUSES,
  MEDIA_PROVIDERS,
  MEDIA_VIDEO_STATUSES,
} from '@vault/common/media';
import type { EmbedMetadata, IEmbedVideo } from '@vault/common/types';
import { In, Repository } from 'typeorm';

import { getMediaCacheConfig } from '../../config/env';
import { Embed } from '../../entities/embed.entity';
import { File } from '../../entities/file.entity';
import { ExternalMedia, MediaJob } from '../../entities/media.entity';
import { mediaVideoPath } from '../media/media.paths';
import { isYoutubeId } from '../upload/upload.paths';

import { YoutubeService } from './youtube.service';

const YOUTUBE_PROVIDER = 'youtube';

/** Clients get all three metadata keys, empty when unknown. */
const toWireMetadata = (
  metadata: Partial<EmbedMetadata> | null | undefined,
): EmbedMetadata => ({
  title: metadata?.title ?? '',
  thumb: metadata?.thumb ?? '',
  duration: metadata?.duration ?? '',
});

/** Embeds serialise without timestamps. */
export interface WireEmbed {
  id: number;
  provider: string;
  address: string;
  metadata: EmbedMetadata;
  /** Our copy of the video, when the media cache tracks it. */
  video?: IEmbedVideo;
}

@Injectable()
export class MetaService {
  private readonly logger = new Logger('Meta');

  constructor(
    @InjectRepository(Embed) private readonly embeds: Repository<Embed>,
    private readonly youtube: YoutubeService,
    @InjectRepository(ExternalMedia)
    private readonly media: Repository<ExternalMedia>,
    @InjectRepository(MediaJob) private readonly jobs: Repository<MediaJob>,
    @InjectRepository(File) private readonly files: Repository<File>,
  ) {}

  /**
   * Embed metadata per id, read through the `embed` cache and filling misses
   * from the API in one batched call. A fetch failure is logged and the cached
   * subset still returned: an API outage must not break node rendering.
   */
  async getYoutubeEmbeds(ids: string[]): Promise<Record<string, WireEmbed>> {
    const wanted = ids.map((id) => id.trim()).filter(Boolean);

    if (wanted.length === 0) {
      return {};
    }

    const found = await this.embeds
      .createQueryBuilder('embed')
      .where('embed.provider = :provider', { provider: YOUTUBE_PROVIDER })
      .andWhere('embed.address IN (:...addresses)', { addresses: wanted })
      .andWhere('embed.deleted_at IS NULL')
      .orderBy('embed.id', 'ASC')
      .getMany();

    // `(provider, address)` is not unique; the newest row per address wins.
    const byAddress = new Map<string, Embed>();
    for (const embed of found) {
      byAddress.set(embed.address, embed);
    }

    const missing = wanted.filter((id) => !byAddress.has(id));

    if (missing.length > 0) {
      try {
        const fetched = await this.youtube.fetchByIds(missing);

        if (fetched.size > 0) {
          const created = await this.embeds.save(
            [...fetched.values()].map((item) =>
              this.embeds.create({
                provider: item.provider,
                address: item.address,
                metadata: item.metadata,
              }),
            ),
          );

          for (const embed of created) {
            byAddress.set(embed.address, embed);
          }
        }
      } catch (error) {
        this.logger.error(
          `can't fetch youtube metadata: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    const items: Record<string, WireEmbed> = {};

    for (const id of wanted) {
      const embed = byAddress.get(id);

      // Ids that are neither cached nor resolvable are omitted.
      if (embed) {
        items[id] = {
          id: embed.id,
          provider: embed.provider,
          address: embed.address,
          metadata: toWireMetadata(embed.metadata),
        };
      }
    }

    await this.attachVideos(items, wanted);

    return items;
  }

  /**
   * Adds what the media cache knows to each id: an item it tracks is listed
   * even when no title is known, so clients can still play the copy.
   */
  private async attachVideos(
    items: Record<string, WireEmbed>,
    wanted: string[],
  ): Promise<void> {
    const ids = wanted.filter(isYoutubeId);

    if (ids.length === 0 || !getMediaCacheConfig().enabled) {
      return;
    }

    const tracked = await this.media.findBy({
      provider: MEDIA_PROVIDERS.YOUTUBE,
      externalId: In(ids),
    });

    if (tracked.length === 0) {
      return;
    }

    const downloading = await this.jobs.findBy({
      mediaId: In(tracked.map((item) => item.id)),
      kind: MEDIA_JOB_KINDS.DOWNLOAD,
      status: MEDIA_JOB_STATUSES.RUNNING,
    });
    const fileIds = tracked
      .filter((item) => item.videoStatus === MEDIA_VIDEO_STATUSES.READY)
      .map((item) => item.videoFileId)
      .filter((id): id is number => !!id);
    const sizes = new Map(
      fileIds.length > 0
        ? (await this.files.findBy({ id: In(fileIds) })).map((file) => [
            file.id,
            file.size,
          ])
        : [],
    );
    const progress = new Map(
      downloading.map((job) => [job.mediaId, job.progress]),
    );

    for (const item of tracked) {
      if (item.videoStatus === MEDIA_VIDEO_STATUSES.REMOVED) {
        continue;
      }

      const video: IEmbedVideo = {
        status: item.videoStatus,
        source: item.sourceStatus,
      };

      if (item.videoStatus === MEDIA_VIDEO_STATUSES.DOWNLOADING) {
        video.progress = progress.get(item.id) ?? 0;
      }

      if (item.videoStatus === MEDIA_VIDEO_STATUSES.READY) {
        video.url = `REMOTE_CURRENT://${mediaVideoPath(item.provider, item.externalId)}`;

        if (item.height) {
          video.height = item.height;
        }

        const size = sizes.get(item.videoFileId ?? 0);

        if (size) {
          video.size = size;
        }
      }

      items[item.externalId] = {
        ...(items[item.externalId] ?? {
          id: 0,
          provider: YOUTUBE_PROVIDER,
          address: item.externalId,
          metadata: toWireMetadata(null),
        }),
        video,
      };
    }
  }
}
