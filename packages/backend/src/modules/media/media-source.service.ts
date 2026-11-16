import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MEDIA_PROVIDER_DEFS,
  MEDIA_PROVIDERS,
  MEDIA_SOURCE_STATUSES,
  MEDIA_VIDEO_STATUSES,
  type MediaSourceStatus,
} from '@vault/common/media';
import { Brackets, Repository } from 'typeorm';

import { ExternalMedia } from '../../entities/media.entity';
import { youtubeFetch } from '../../globals/youtube-fetch';

const DAY_MS = 24 * 60 * 60 * 1000;

/** An available original is checked again after this long. */
const AVAILABLE_RECHECK_MS = DAY_MS;

/** A gone original is checked again after this long, in case it returns. */
const GONE_RECHECK_MS = 7 * DAY_MS;

/** Items checked per run; the rest wait for the next one. */
const CHECK_BATCH = 300;

/** Between checks, so a run never looks like a burst to YouTube. */
const PAUSE_MS = 500;

const TIMEOUT_MS = 10_000;

const OEMBED_URL = 'https://www.youtube.com/oembed';

/**
 * What YouTube's oEmbed answer says about a video: playable, gone (removed,
 * private or not embeddable), or null when the answer says nothing (network
 * trouble, rate limiting), so the stored state is kept.
 */
export const sourceStatusFromOembed = (
  status: number,
): MediaSourceStatus | null => {
  if (status === 200) {
    return MEDIA_SOURCE_STATUSES.AVAILABLE;
  }

  return [401, 403, 404].includes(status) ? MEDIA_SOURCE_STATUSES.GONE : null;
};

/**
 * Keeps track of whether the originals we hold copies of can still be played
 * on YouTube, through its public oEmbed endpoint (no API key, no quota).
 * Clients play the original while it is there and the copy once it is not.
 */
@Injectable()
export class MediaSourceService {
  private readonly logger = new Logger('MediaSource');

  constructor(
    @InjectRepository(ExternalMedia)
    private readonly media: Repository<ExternalMedia>,
  ) {}

  /** Checks the copies whose original is due a check; returns how many changed. */
  async checkDue(now = new Date()): Promise<number> {
    const due = await this.media
      .createQueryBuilder('media')
      .where('media.provider = :provider', {
        provider: MEDIA_PROVIDERS.YOUTUBE,
      })
      .andWhere('media.video_status = :ready', {
        ready: MEDIA_VIDEO_STATUSES.READY,
      })
      .andWhere(
        new Brackets((query) =>
          query
            .where('media.source_checked_at IS NULL')
            .orWhere(
              'media.source_status <> :gone AND media.source_checked_at < :availableBefore',
            )
            .orWhere(
              'media.source_status = :gone AND media.source_checked_at < :goneBefore',
            ),
        ),
      )
      .setParameters({
        gone: MEDIA_SOURCE_STATUSES.GONE,
        availableBefore: new Date(now.getTime() - AVAILABLE_RECHECK_MS),
        goneBefore: new Date(now.getTime() - GONE_RECHECK_MS),
      })
      .orderBy('media.source_checked_at', 'ASC')
      .take(CHECK_BATCH)
      .getMany();

    let changed = 0;

    for (const item of due) {
      const status = await this.check(item.externalId);

      if (status === null) {
        continue;
      }

      if (status !== item.sourceStatus) {
        changed += 1;
        this.logger.log(`youtube ${item.externalId}: original is ${status}`);
      }

      await this.media.update(item.id, {
        sourceStatus: status,
        sourceCheckedAt: new Date(),
      });

      await new Promise((resolve) => setTimeout(resolve, PAUSE_MS).unref());
    }

    return changed;
  }

  private async check(id: string): Promise<MediaSourceStatus | null> {
    const url = new URL(OEMBED_URL);
    url.searchParams.set(
      'url',
      MEDIA_PROVIDER_DEFS[MEDIA_PROVIDERS.YOUTUBE].canonicalUrl(id),
    );
    url.searchParams.set('format', 'json');

    try {
      const response = await youtubeFetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      await response.body?.cancel().catch((): void => undefined);

      return sourceStatusFromOembed(response.status);
    } catch (error) {
      this.logger.warn(
        `could not check youtube ${id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }
}
