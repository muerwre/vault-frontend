import { Controller, Get } from '@nestjs/common';

import { StatsService, type WireStats } from './stats.service';

/** Clients call `/stats/` with a trailing slash; loose routing serves both. */
@Controller('stats')
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get()
  getStats(): Promise<WireStats> {
    return this.stats.getStats();
  }
}
