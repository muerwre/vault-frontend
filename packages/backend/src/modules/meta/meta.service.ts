import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EmbedMetadata } from '@vault/common/types';
import { Repository } from 'typeorm';

import { Embed } from '../../entities/embed.entity';

import { YoutubeService } from './youtube.service';

const YOUTUBE_PROVIDER = 'youtube';

/** Embeds serialise without timestamps. */
export interface WireEmbed {
  id: number;
  provider: string;
  address: string;
  metadata: EmbedMetadata;
}

@Injectable()
export class MetaService {
  private readonly logger = new Logger('Meta');

  constructor(
    @InjectRepository(Embed) private readonly embeds: Repository<Embed>,
    private readonly youtube: YoutubeService,
  ) {}

  /**
   * Embed metadata per id, read through the `embed` cache and filling misses
   * from the API in one batched call. A fetch failure is logged and the cached
   * subset still returned: an API outage must not break node rendering.
   */
  async getYoutubeEmbeds(ids: string[]): Promise<Record<string, WireEmbed>> {
    const wanted = ids.map(id => id.trim()).filter(Boolean);

    if (wanted.length === 0) {
      return {};
    }

    const found = await this.embeds
      .createQueryBuilder('embed')
      .where('embed.provider = :provider', { provider: YOUTUBE_PROVIDER })
      .andWhere('embed.address IN (:...addresses)', { addresses: wanted })
      .getMany();

    // `(provider, address)` is not unique; keep the first row per address.

    const byAddress = new Map<string, Embed>();
    for (const embed of found) {
      if (!byAddress.has(embed.address)) {
        byAddress.set(embed.address, embed);
      }
    }

    const missing = wanted.filter(id => !byAddress.has(id));

    if (missing.length > 0) {
      try {
        const fetched = await this.youtube.fetchByIds(missing);

        if (fetched.size > 0) {
          const created = await this.embeds.save(
            [...fetched.values()].map(item =>
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
          metadata: embed.metadata ?? {},
        };
      }
    }

    return items;
  }
}
