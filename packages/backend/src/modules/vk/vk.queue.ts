import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { AppNotification } from '../../entities/notification.entity';

/** Identifies this publisher's rows in the shared queue. */
export const VK_APP_ID = 'vk';

/**
 * The publication queue: what is waiting to be posted, and what already has
 * been. Rows are keyed by `(app, item_id, type)`.
 */
@Injectable()
export class VkQueueService {
  constructor(
    @InjectRepository(AppNotification)
    private readonly queue: Repository<AppNotification>,
  ) {}

  /** Enqueues an item, ignoring one that is already queued. True when added. */
  async enqueue(
    type: string,
    itemId: number,
    itemCreatedAt: Date | null,
  ): Promise<boolean> {
    const existing = await this.queue.findOne({
      where: { app: VK_APP_ID, itemId, type },
    });

    if (existing) {
      return false;
    }

    const now = new Date();
    now.setMilliseconds(0);

    await this.queue.insert({
      app: VK_APP_ID,
      type,
      itemId,
      itemCreatedAt,
      sentAt: null,
      createdAt: now,
      updatedAt: now,
    });

    return true;
  }

  /**
   * Drops an item that has not gone out yet; a published one is left alone.
   * True when something was dropped.
   */
  async dropUnsent(type: string, itemId: number): Promise<boolean> {
    const { affected } = await this.queue.delete({
      app: VK_APP_ID,
      type,
      itemId,
      sentAt: IsNull(),
    });

    return Boolean(affected);
  }

  /**
   * Unsent items ripe for publishing: older than the cooldown, so a just-created
   * node can still be edited or deleted before it is announced, but newer than
   * the purge horizon, so a long-queued backlog is never dumped at once.
   */
  pending(
    type: string,
    olderThan: Date,
    newerThan: Date,
  ): Promise<AppNotification[]> {
    return this.queue
      .createQueryBuilder('queue')
      .where('queue.app = :app AND queue.type = :type', {
        app: VK_APP_ID,
        type,
      })
      .andWhere('queue.sent_at IS NULL')
      .andWhere('queue.created_at < :olderThan', { olderThan })
      .andWhere('queue.created_at > :newerThan', { newerThan })
      .orderBy('queue.created_at', 'ASC')
      .getMany();
  }

  async markSent(type: string, itemId: number, at: Date): Promise<void> {
    await this.queue.update(
      { app: VK_APP_ID, type, itemId, sentAt: IsNull() },
      { sentAt: at, updatedAt: at },
    );
  }
}
