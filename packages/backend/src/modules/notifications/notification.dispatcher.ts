import { Injectable, Logger } from '@nestjs/common';
import { NOTIFICATION_QUEUE_TYPES } from '@vault/common/constants';

import type { NotificationConsumer, NotificationEvent } from './notification.events';
import { UserNotificationConsumer } from './user-notification.consumer';

/**
 * Single entry point write endpoints use to announce a change.
 *
 * Dispatch **never throws**: a notification is a side effect, so a failing
 * consumer must not fail the write that triggered it. Consumers run in turn and
 * are awaited, which keeps a write and its notifications one observable unit.
 */
@Injectable()
export class NotificationDispatcher {
  private readonly logger = new Logger(NotificationDispatcher.name);

  private readonly consumers: NotificationConsumer[];

  constructor(userNotifications: UserNotificationConsumer) {
    this.consumers = [userNotifications];
  }

  async dispatch(event: NotificationEvent): Promise<void> {
    for (const consumer of this.consumers) {
      try {
        await consumer.consume(event);
      } catch (error) {
        this.logger.warn(
          `${consumer.name} failed on ${event.type} ${event.itemId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  nodeCreated(itemId: number): Promise<void> {
    return this.dispatch({
      type: NOTIFICATION_QUEUE_TYPES.NODE_CREATE,
      itemId,
    });
  }

  nodeDeleted(itemId: number): Promise<void> {
    return this.dispatch({
      type: NOTIFICATION_QUEUE_TYPES.NODE_DELETE,
      itemId,
    });
  }

  nodeRestored(itemId: number): Promise<void> {
    return this.dispatch({
      type: NOTIFICATION_QUEUE_TYPES.NODE_RESTORE,
      itemId,
    });
  }

  commentCreated(itemId: number): Promise<void> {
    return this.dispatch({
      type: NOTIFICATION_QUEUE_TYPES.COMMENT_CREATE,
      itemId,
    });
  }

  commentDeleted(itemId: number): Promise<void> {
    return this.dispatch({
      type: NOTIFICATION_QUEUE_TYPES.COMMENT_DELETE,
      itemId,
    });
  }

  commentRestored(itemId: number): Promise<void> {
    return this.dispatch({
      type: NOTIFICATION_QUEUE_TYPES.COMMENT_RESTORE,
      itemId,
    });
  }
}
