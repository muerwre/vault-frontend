import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Comment } from '../../entities/comment.entity';
import { Node } from '../../entities/node.entity';
import {
  NotificationSettings,
  UserNotification,
  UserNotificationProcessed,
} from '../../entities/notification.entity';
import { Social } from '../../entities/social.entity';
import { NotificationsModule } from '../notifications/notifications.module';

import { TelegramBot } from './telegram.bot';
import { TelegramNotificationSender } from './telegram.sender';
import { TelegramTransport } from './telegram.transport';

/**
 * The Telegram bot and notification delivery. Global so account linking can
 * greet a new user without threading the module through OAuth.
 *
 * Both the bot and the sender stay idle unless `TELEGRAM_BOT_ENABLED` is set.
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Social,
      UserNotification,
      UserNotificationProcessed,
      NotificationSettings,
      Node,
      Comment,
    ]),
    NotificationsModule,
  ],
  providers: [TelegramTransport, TelegramBot, TelegramNotificationSender],
  exports: [TelegramTransport, TelegramBot],
})
export class TelegramModule {}
