import { Module } from '@nestjs/common';

import { CONFIG } from './config/env';
import { DATABASE } from './database/database.module';
import { JWT } from './globals/jwt';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { CommentModule } from './modules/comment/comment.module';
import { MailModule } from './modules/mail/mail.module';
import { MetaModule } from './modules/meta/meta.module';
import { NodeModule } from './modules/node/node.module';
import { NotesModule } from './modules/notes/notes.module';
import { SearchModule } from './modules/search/search.module';
import { StatsModule } from './modules/stats/stats.module';
import { TagModule } from './modules/tag/tag.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    CONFIG,
    DATABASE,
    JWT,
    MailModule,
    AuthModule,
    NodeModule,
    CommentModule,
    UserModule,
    NotesModule,
    StatsModule,
    SearchModule,
    TagModule,
    MetaModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
