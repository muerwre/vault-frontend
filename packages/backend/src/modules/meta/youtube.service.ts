import { Injectable, Logger } from '@nestjs/common';
import type { EmbedMetadata } from '@vault/common/types';

import { getGoogleApiKey } from '../../config/env';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/videos';

export interface FetchedEmbed {
  address: string;
  provider: 'youtube';
  metadata: EmbedMetadata;
}

/**
 * YouTube Data API v3 client.
 *
 * Requests `part=snippet` and stores only the title; `thumb` and `duration` stay
 * empty. Widening this changes the stored metadata blob of every new embed.
 */
@Injectable()
export class YoutubeService {
  private readonly logger = new Logger('Youtube');

  private get apiKey(): string {
    return getGoogleApiKey();
  }

  /** Returns a map keyed by video id. Ids YouTube doesn't know are simply absent. */
  async fetchByIds(ids: string[]): Promise<Map<string, FetchedEmbed>> {
    const result = new Map<string, FetchedEmbed>();

    if (ids.length === 0) {
      return result;
    }

    // Optional by config: without a key, only cached embeds are served.
    if (!this.apiKey) {
      this.logger.warn('GOOGLE_API_KEY is not set — serving cached embeds only');
      return result;
    }

    const url = new URL(YOUTUBE_API_URL);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('id', ids.join(','));
    url.searchParams.set('part', 'snippet');

    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
      };

      throw new Error(
        `YouTube API request unsuccessfull: ${body.error?.message ?? response.status}`,
      );
    }

    const body = (await response.json()) as {
      items?: Array<{ id?: string; snippet?: { title?: string } }>;
    };

    for (const item of body.items ?? []) {
      if (!item.id) {
        continue;
      }

      result.set(item.id, {
        address: item.id,
        provider: 'youtube',
        metadata: { title: item.snippet?.title ?? '' },
      });
    }

    return result;
  }
}
