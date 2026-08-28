import { Module } from '@nestjs/common';

import { CONFIG } from './config/env';
import { DATABASE } from './database/database.module';
import { JWT } from './globals/jwt';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { MetaModule } from './modules/meta/meta.module';
import { SearchModule } from './modules/search/search.module';
import { StatsModule } from './modules/stats/stats.module';
import { TagModule } from './modules/tag/tag.module';

@Module({
  imports: [
    CONFIG,
    DATABASE,
    JWT,
    AuthModule,
    StatsModule,
    SearchModule,
    TagModule,
    MetaModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
