import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { CONFIG } from './config/env';
import { DATABASE } from './database/database.module';
import { GuestAudioInterceptor } from './globals/guest-audio';
import { JWT } from './globals/jwt';
import { HealthController } from './health.controller';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommentModule } from './modules/comment/comment.module';
import { MailModule } from './modules/mail/mail.module';
import { MetaModule } from './modules/meta/meta.module';
import { NodeModule } from './modules/node/node.module';
import { NotesModule } from './modules/notes/notes.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OAuthModule } from './modules/oauth/oauth.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { SearchModule } from './modules/search/search.module';
import { StatsModule } from './modules/stats/stats.module';
import { TagModule } from './modules/tag/tag.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { UploadModule } from './modules/upload/upload.module';
import { UserModule } from './modules/user/user.module';
import { VkModule } from './modules/vk/vk.module';

@Module({
  imports: [
    CONFIG,
    DATABASE,
    JWT,
    ScheduleModule.forRoot(),
    MailModule,
    AuthModule,
    NodeModule,
    CommentModule,
    UserModule,
    NotesModule,
    NotificationsModule,
    OAuthModule,
    UploadModule,
    StatsModule,
    SearchModule,
    TagModule,
    TelegramModule,
    VkModule,
    MetaModule,
    AdminModule,
    RegistrationModule,
  ],
  controllers: [HealthController],
  providers: [
    // guests get songs without the address to play them from
    { provide: APP_INTERCEPTOR, useClass: GuestAudioInterceptor },
  ],
})
export class AppModule {}
