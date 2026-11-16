import { Injectable, Logger } from '@nestjs/common';
import type { EmbedMetadata } from '@vault/common/types';

import { getGoogleApiKey } from '../../config/env';
import { youtubeFetch } from '../../globals/youtube-fetch';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/videos';

export interface FetchedEmbed {
  address: string;
  provider: 'youtube';
  metadata: EmbedMetadata;
}

/**
 * YouTube Data API v3 client.
 *
 * Requests `part=snippet` and fills only the title; `thumb` and `duration` are
 * stored empty, so every cached blob carries all three keys.
 */
@Injectable()
export class YoutubeService {
  private readonly logger = new Logger('Youtube');

  private get apiKey(): string {
    return getGoogleApiKey();
  }

  /** Whether the Data API can be called at all. */
  get isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  /** Returns a map keyed by video id. Ids YouTube doesn't know are simply absent. */
  async fetchByIds(ids: string[]): Promise<Map<string, FetchedEmbed>> {
    const result = new Map<string, FetchedEmbed>();

    if (ids.length === 0) {
      return result;
    }

    // Optional by config: without a key, only cached embeds are served.
    if (!this.apiKey) {
      this.logger.warn(
        'GOOGLE_API_KEY is not set — serving cached embeds only',
      );
      return result;
    }

    for (const item of await this.request(ids, 'snippet')) {
      if (!item.id) {
        continue;
      }

      result.set(item.id, {
        address: item.id,
        provider: 'youtube',
        metadata: { title: item.snippet?.title ?? '', thumb: '', duration: '' },
      });
    }

    return result;
  }

  /**
   * Title, length and live state per video id, in batches of the API's maximum.
   * Ids YouTube doesn't know (removed, private) are absent. Throws when the API
   * is not configured or a request fails, so callers can tell that apart from
   * "not found".
   */
  async fetchDetails(ids: string[]): Promise<Map<string, YoutubeDetails>> {
    if (!this.apiKey) {
      throw new Error('GOOGLE_API_KEY is not set');
    }

    const result = new Map<string, YoutubeDetails>();

    for (let start = 0; start < ids.length; start += MAX_IDS_PER_REQUEST) {
      const batch = ids.slice(start, start + MAX_IDS_PER_REQUEST);

      for (const item of await this.request(batch, 'snippet,contentDetails')) {
        if (!item.id) {
          continue;
        }

        result.set(item.id, {
          title: item.snippet?.title ?? '',
          duration: parseIsoDuration(item.contentDetails?.duration ?? ''),
          isLive: (item.snippet?.liveBroadcastContent ?? 'none') !== 'none',
        });
      }
    }

    return result;
  }

  private async request(ids: string[], part: string): Promise<VideoItem[]> {
    const url = new URL(YOUTUBE_API_URL);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('id', ids.join(','));
    url.searchParams.set('part', part);

    const response = await youtubeFetch(url, { method: 'GET' });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
      };

      throw new Error(
        `YouTube API request unsuccessfull: ${body.error?.message ?? response.status}`,
      );
    }

    const body = (await response.json()) as { items?: VideoItem[] };

    return body.items ?? [];
  }
}

/** The API's own limit on ids per `videos.list` call. */
const MAX_IDS_PER_REQUEST = 50;

interface VideoItem {
  id?: string;
  snippet?: { title?: string; liveBroadcastContent?: string };
  contentDetails?: { duration?: string };
}

export interface YoutubeDetails {
  title: string;
  /** Seconds; null when YouTube reports none, as for live and upcoming streams. */
  duration: number | null;
  isLive: boolean;
}

const ISO_DURATION =
  /^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

/**
 * Seconds in an ISO 8601 duration such as `PT1H2M3S` or `P1DT2H`. Null for
 * anything unparseable, and for zero, which YouTube reports for streams.
 */
export const parseIsoDuration = (value: string): number | null => {
  const match = ISO_DURATION.exec(value ?? '');

  if (!match || value === 'P' || value.endsWith('T')) {
    return null;
  }

  const [weeks, days, hours, minutes, seconds] = match
    .slice(1)
    .map((part) => Number(part ?? 0));

  const total = Math.round(
    (((weeks * 7 + days) * 24 + hours) * 60 + minutes) * 60 + seconds,
  );

  return total > 0 ? total : null;
};
