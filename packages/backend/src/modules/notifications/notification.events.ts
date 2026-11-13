import type { NotificationQueueType } from '@vault/common/constants';

/**
 * A write worth telling someone about. Carries only the subject's identity —
 * consumers load whatever else they need, so an event never goes stale.
 */
export interface NotificationEvent {
  type: NotificationQueueType;
  itemId: number;
}

export interface NotificationConsumer {
  /** Identifies the consumer in logs. */
  readonly name: string;

  consume(event: NotificationEvent): Promise<void>;
}
