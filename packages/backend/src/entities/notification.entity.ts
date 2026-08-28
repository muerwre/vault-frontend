import type { NotificationItemType } from '@vault/common/constants';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { MODERN_ID_NULLABLE, modernBool, TIMESTAMP_NULLABLE } from './columns';

/**
 * Modern dialect throughout: utf8mb4, `int(10) unsigned` keys, no foreign keys,
 * nullable `timestamp` columns with no default. Use plain `@Column`, never
 * `@CreateDateColumn` — that adds a CURRENT_TIMESTAMP default.
 */

const modernVarchar = {
  type: 'varchar',
  length: 255,
  nullable: true,
} as const;

/**
 * The per-user notification feed. Table name is plural; the identically-shaped
 * `notifications` table is dead (see {@link NotificationsOrphan}).
 */
@Entity('user_notifications')
export class UserNotification {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ ...modernVarchar })
  type: NotificationItemType | null;

  /** Id of the node/comment the notification points at. Wire key is `itemId`. */
  @Index('item_id')
  @Column({ name: 'itemId', ...MODERN_ID_NULLABLE })
  itemId: number | null;

  @Column({ name: 'time', ...TIMESTAMP_NULLABLE })
  time: Date | null;

  /** Recipient. Hidden on the wire. */
  @Column({ name: 'userId', ...MODERN_ID_NULLABLE })
  userId: number | null;

  @Column({ name: 'created_at', ...TIMESTAMP_NULLABLE })
  createdAt: Date | null;

  @Column({ name: 'updated_at', ...TIMESTAMP_NULLABLE })
  updatedAt: Date | null;

  @Index('idx_user_notifications_deleted_at')
  @Column({ name: 'deleted_at', ...TIMESTAMP_NULLABLE })
  deletedAt: Date | null;
}

/** Dead table, superseded by {@link UserNotification}. Nothing reads it. */
@Entity('notifications')
export class NotificationsOrphan {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ ...modernVarchar })
  type: string | null;

  @Index('item_id')
  @Column({ name: 'itemId', ...MODERN_ID_NULLABLE })
  itemId: number | null;

  @Column({ name: 'time', ...TIMESTAMP_NULLABLE })
  time: Date | null;

  @Column({ name: 'userId', ...MODERN_ID_NULLABLE })
  userId: number | null;

  @Column({ name: 'created_at', ...TIMESTAMP_NULLABLE })
  createdAt: Date | null;

  @Column({ name: 'updated_at', ...TIMESTAMP_NULLABLE })
  updatedAt: Date | null;

  @Index('idx_notifications_deleted_at')
  @Column({ name: 'deleted_at', ...TIMESTAMP_NULLABLE })
  deletedAt: Date | null;
}

/** Delivery ledger: which external service already handled a notification. */
@Entity('user_notifications_processed')
export class UserNotificationProcessed {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  service: string;

  @Column({ name: 'processed_at', ...TIMESTAMP_NULLABLE })
  processedAt: Date | null;

  @Column({ name: 'notification_id', ...MODERN_ID_NULLABLE })
  notificationId: number | null;
}

/** Dead table, superseded by {@link UserNotificationProcessed}. */
@Entity('user_notifications_sent')
export class UserNotificationSentOrphan {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  service: string;

  @Column({ name: 'sent_at', ...TIMESTAMP_NULLABLE })
  sentAt: Date | null;

  @Column({ name: 'notification_id', ...MODERN_ID_NULLABLE })
  notificationId: number | null;
}

/** Source event queue. No recipient; the dispatcher fans these out per user. */
@Entity('app_notifications')
export class AppNotification {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ ...modernVarchar })
  app: string | null;

  @Column({ ...modernVarchar })
  type: string | null;

  @Index('item_id')
  @Column({ name: 'item_id', ...MODERN_ID_NULLABLE })
  itemId: number | null;

  @Column({ name: 'item_created_at', ...TIMESTAMP_NULLABLE })
  itemCreatedAt: Date | null;

  @Column({ name: 'sent_at', ...TIMESTAMP_NULLABLE })
  sentAt: Date | null;

  @Column({ name: 'created_at', ...TIMESTAMP_NULLABLE })
  createdAt: Date | null;

  @Column({ name: 'updated_at', ...TIMESTAMP_NULLABLE })
  updatedAt: Date | null;

  @Index('idx_app_notifications_deleted_at')
  @Column({ name: 'deleted_at', ...TIMESTAMP_NULLABLE })
  deletedAt: Date | null;
}

/**
 * Per-user notification preferences.
 *
 * `userId` has **no unique index**, so duplicate rows per user are possible —
 * reads must pick deterministically rather than assume uniqueness.
 *
 * Wire keys differ from columns: `flow` ← `subscribed_to_flow`,
 * `boris` ← `subscribed_to_boris`, `comments` ← `subscribed_to_comments`.
 */
@Entity('notification_settings')
export class NotificationSettings {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'userId', ...MODERN_ID_NULLABLE })
  userId: number | null;

  @Column({ name: 'enabled', ...modernBool({ default: 1 }) })
  enabled: boolean | null;

  @Column({ name: 'show_indicator', ...modernBool() })
  showIndicator: boolean | null;

  @Column({ name: 'send_telegram', ...modernBool() })
  sendTelegram: boolean | null;

  @Column({ name: 'send_email', ...modernBool() })
  sendEmail: boolean | null;

  @Column({ name: 'subscribed_to_flow', ...modernBool() })
  subscribedToFlow: boolean | null;

  @Column({ name: 'subscribed_to_boris', ...modernBool() })
  subscribedToBoris: boolean | null;

  @Column({ name: 'subscribed_to_comments', ...modernBool({ default: 1 }) })
  subscribedToComments: boolean | null;

  @Column({ name: 'last_seen', ...TIMESTAMP_NULLABLE })
  lastSeen: Date | null;

  @Column({ name: 'last_cleared', ...TIMESTAMP_NULLABLE })
  lastCleared: Date | null;

  @Column({ name: 'last_seen_notifications', ...TIMESTAMP_NULLABLE })
  lastSeenNotifications: Date | null;
}
