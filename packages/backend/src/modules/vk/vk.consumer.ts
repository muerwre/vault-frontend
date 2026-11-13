import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NOTIFICATION_ITEM_TYPES,
  NOTIFICATION_QUEUE_TYPES,
} from '@vault/common/constants';
import { Repository } from 'typeorm';

import { Node } from '../../entities/node.entity';
import { NotificationDispatcher } from '../notifications/notification.dispatcher';
import type {
  NotificationConsumer,
  NotificationEvent,
} from '../notifications/notification.events';

import { VkQueueService } from './vk.queue';

/**
 * Queues nodes for publication to the VK wall.
 *
 * Only nodes are announced there, and only as a queue write — the actual post
 * happens later, on the publisher's schedule. Deleting a node before it goes
 * out withdraws it.
 */
@Injectable()
export class VkConsumer implements NotificationConsumer, OnModuleInit {
  readonly name = 'vk-wall';

  private readonly logger = new Logger('VK');

  constructor(
    private readonly queue: VkQueueService,
    private readonly dispatcher: NotificationDispatcher,
    @InjectRepository(Node) private readonly nodes: Repository<Node>,
  ) {}

  onModuleInit(): void {
    this.dispatcher.register(this);
  }

  async consume(event: NotificationEvent): Promise<void> {
    switch (event.type) {
      case NOTIFICATION_QUEUE_TYPES.NODE_CREATE:
      case NOTIFICATION_QUEUE_TYPES.NODE_RESTORE: {
        const node = await this.nodes.findOne({
          where: { id: event.itemId },
          select: { id: true, createdAt: true },
        });

        const queued = await this.queue.enqueue(
          NOTIFICATION_ITEM_TYPES.NODE,
          event.itemId,
          node?.createdAt ?? null,
        );

        if (queued) {
          this.logger.log(`queued node ${event.itemId} for the wall`);
        }

        return;
      }
      case NOTIFICATION_QUEUE_TYPES.NODE_DELETE:
        if (
          await this.queue.dropUnsent(
            NOTIFICATION_ITEM_TYPES.NODE,
            event.itemId,
          )
        ) {
          this.logger.log(`withdrew node ${event.itemId} from the wall queue`);
        }

        return;
      default:
        return undefined;
    }
  }
}
