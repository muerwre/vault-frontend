import { Controller, Get, Query } from '@nestjs/common';

import { MetaService, type WireEmbed } from './meta.service';

@Controller('meta')
export class MetaController {
  constructor(private readonly meta: MetaService) {}

  /** Public. `ids` is a comma-separated list; the response is keyed by id. */
  @Get('youtube')
  async getYoutube(
    @Query('ids') ids?: string,
  ): Promise<{ items: Record<string, WireEmbed> }> {
    return { items: await this.meta.getYoutubeEmbeds((ids ?? '').split(',')) };
  }
}
