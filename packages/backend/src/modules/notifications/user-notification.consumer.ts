import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NOTIFICATION_ITEM_TYPES,
  NOTIFICATION_QUEUE_TYPES,
  type NotificationItemType,
} from '@vault/common/constants';
import { In, Repository } from 'typeorm';

import { Comment } from '../../entities/comment.entity';
import { Node } from '../../entities/node.entity';
import { UserNotification } from '../../entities/notification.entity';

import type { NotificationConsumer, NotificationEvent } from './notification.events';
import { NotificationRecipientsService } from './notification.recipients';
import {
  COMMENT_ITEM_TYPES,
  commentItemType,
  shouldAnnounceComment,
  shouldAnnounceNode,
} from './notification.rules';

/**
 * Fans an event out into per-recipient `user_notifications` rows, which is what
 * the notification feed reads.
 *
 * A subject's rows are **hard-deleted** when it is removed and rebuilt when it
 * comes back, so the feed never shows anything that is currently deleted.
 */
@Injectable()
export class UserNotificationConsumer implements NotificationConsumer {
  readonly name = 'user-notifications';

  constructor(
    @InjectRepository(UserNotification)
    private readonly notifications: Repository<UserNotification>,
    @InjectRepository(Node) private readonly nodes: Repository<Node>,
    @InjectRepository(Comment) private readonly comments: Repository<Comment>,
    private readonly recipients: NotificationRecipientsService,
  ) {}

  async consume(event: NotificationEvent): Promise<void> {
    switch (event.type) {
      case NOTIFICATION_QUEUE_TYPES.NODE_CREATE:
      case NOTIFICATION_QUEUE_TYPES.NODE_RESTORE:
        return this.nodeAdded(event.itemId);
      case NOTIFICATION_QUEUE_TYPES.NODE_DELETE:
        return this.remove([NOTIFICATION_ITEM_TYPES.NODE], event.itemId);
      case NOTIFICATION_QUEUE_TYPES.COMMENT_CREATE:
      case NOTIFICATION_QUEUE_TYPES.COMMENT_RESTORE:
        return this.commentAdded(event.itemId);
      case NOTIFICATION_QUEUE_TYPES.COMMENT_DELETE:
        return this.remove(COMMENT_ITEM_TYPES, event.itemId);
      default:
        return undefined;
    }
  }

  private async nodeAdded(nodeId: number): Promise<void> {
    const node = await this.nodes
      .createQueryBuilder('node')
      .where('node.id = :nodeId AND node.deleted_at IS NULL', { nodeId })
      .getOne();

    if (!node || !shouldAnnounceNode(node)) {
      return;
    }

    await this.add(
      NOTIFICATION_ITEM_TYPES.NODE,
      node.id,
      node.createdAt,
      await this.recipients.flowWatchers(),
      node.userId,
    );
  }

  private async commentAdded(commentId: number): Promise<void> {
    // Deliberately includes deleted comments: a restore notifies again.
    const comment = await this.comments
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.node', 'node')
      .where('comment.id = :commentId', { commentId })
      .getOne();

    if (!comment?.node || !shouldAnnounceComment(comment.node)) {
      return;
    }

    const type = commentItemType(comment.node);
    const recipients =
      type === NOTIFICATION_ITEM_TYPES.BORIS
        ? await this.recipients.borisWatchers()
        : await this.recipients.nodeParticipants(comment.node.id);

    await this.add(type, comment.id, comment.createdAt, recipients, comment.userId);
  }

  /**
   * Writes one row per recipient, skipping the author and anyone who already
   * has a live row for this subject — so re-saving an item does not duplicate
   * its feed entry.
   *
   * `time` and `created_at` are the **subject's** creation time, not now, so
   * the feed orders by when things happened.
   */
  private async add(
    type: NotificationItemType,
    itemId: number,
    at: Date | null,
    recipients: number[],
    authorId: number | null,
  ): Promise<void> {
    const candidates = recipients.filter(userId => userId !== authorId);

    if (candidates.length === 0) {
      return;
    }

    const existing = await this.notifications
      .createQueryBuilder('n')
      .select('n.userId', 'userId')
      .where('n.type = :type AND n.itemId = :itemId', { type, itemId })
      .andWhere('n.deleted_at IS NULL')
      .getRawMany<{ userId: number }>();

    const notified = new Set(existing.map(row => Number(row.userId)));
    const fresh = candidates.filter(userId => !notified.has(userId));

    if (fresh.length === 0) {
      return;
    }

    await this.notifications.insert(
      fresh.map(userId => ({
        type,
        itemId,
        userId,
        time: at,
        createdAt: at,
        updatedAt: at,
      })),
    );
  }

  /** Hard delete: a removed subject leaves no trace in anyone's feed. */
  private async remove(
    types: readonly NotificationItemType[],
    itemId: number,
  ): Promise<void> {
    await this.notifications.delete({ type: In(types as NotificationItemType[]), itemId });
  }
}
