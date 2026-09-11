import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NodeSocialPublication } from '../../entities/node-extras.entity';
import { Node } from '../../entities/node.entity';
import { AppNotification } from '../../entities/notification.entity';
import { NotificationsModule } from '../notifications/notifications.module';

import { VkApiService } from './vk.api';
import { VkConsumer } from './vk.consumer';
import { VkPublisher } from './vk.publisher';
import { VkQueueService } from './vk.queue';

/**
 * Announces new nodes on the group wall. Queuing always happens; posting only
 * when the publisher is configured and enabled.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([AppNotification, Node, NodeSocialPublication]),
    NotificationsModule,
  ],
  providers: [VkQueueService, VkApiService, VkConsumer, VkPublisher],
  exports: [VkQueueService],
})
export class VkModule {}
