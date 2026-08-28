import { Module } from '@nestjs/common';

import { CONFIG } from './config/env';
import { DATABASE } from './database/database.module';
import { JWT } from './globals/jwt';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [CONFIG, DATABASE, JWT, AuthModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
