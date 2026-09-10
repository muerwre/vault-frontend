import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Comment } from '../../entities/comment.entity';
import { Node } from '../../entities/node.entity';
import {
  NotificationSettings,
  UserNotification,
} from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';

import { NotificationDispatcher } from './notification.dispatcher';
import { NotificationRecipientsService } from './notification.recipients';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { UserNotificationConsumer } from './user-notification.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserNotification,
      NotificationSettings,
      Node,
      Comment,
      User,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationRecipientsService,
    UserNotificationConsumer,
    NotificationDispatcher,
  ],
  // Write endpoints announce their changes through the dispatcher alone.
  exports: [NotificationDispatcher],
})
export class NotificationsModule {}
