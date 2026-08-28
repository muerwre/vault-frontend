import type { NotificationItemType } from '@vault/common/constants';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { GORM_ID_NULLABLE, gormBool, TIMESTAMP_NULLABLE } from './columns';

/**
 * All entities in this file use the **GORM dialect**: server-default utf8mb4,
 * `int(10) unsigned` keys, no foreign keys, and nullable `timestamp` date
 * columns with no default (so plain `@Column`, never `@CreateDateColumn`, which
 * would add a CURRENT_TIMESTAMP default).
 */

const gormVarchar = {
  type: 'varchar',
  length: 255,
  nullable: true,
} as const;

/**
 * `user_notifications` — **the live per-user notification feed** (546 rows).
 *
 * ⚠️ Table name is plural. The identically-shaped `notifications` table is empty
 * and dead (see NotificationsOrphan).
 */
@Entity('user_notifications')
export class UserNotification {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ ...gormVarchar })
  type: NotificationItemType | null;

  /** Id of the node/comment the notification points at. Wire key is `itemId`. */
  @Index('item_id')
  @Column({ name: 'itemId', ...GORM_ID_NULLABLE })
  itemId: number | null;

  @Column({ name: 'time', ...TIMESTAMP_NULLABLE })
  time: Date | null;

  /** Recipient. Hidden on the wire. */
  @Column({ name: 'userId', ...GORM_ID_NULLABLE })
  userId: number | null;

  @Column({ name: 'created_at', ...TIMESTAMP_NULLABLE })
  createdAt: Date | null;

  @Column({ name: 'updated_at', ...TIMESTAMP_NULLABLE })
  updatedAt: Date | null;

  @Index('idx_user_notifications_deleted_at')
  @Column({ name: 'deleted_at', ...TIMESTAMP_NULLABLE })
  deletedAt: Date | null;
}

/**
 * `notifications` — **dead table** (0 rows), same shape as `user_notifications`.
 * An artefact of a renamed GORM model. Kept for baseline-migration completeness
 * only; nothing reads it.
 */
@Entity('notifications')
export class NotificationsOrphan {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ ...gormVarchar })
  type: string | null;

  @Index('item_id')
  @Column({ name: 'itemId', ...GORM_ID_NULLABLE })
  itemId: number | null;

  @Column({ name: 'time', ...TIMESTAMP_NULLABLE })
  time: Date | null;

  @Column({ name: 'userId', ...GORM_ID_NULLABLE })
  userId: number | null;

  @Column({ name: 'created_at', ...TIMESTAMP_NULLABLE })
  createdAt: Date | null;

  @Column({ name: 'updated_at', ...TIMESTAMP_NULLABLE })
  updatedAt: Date | null;

  @Index('idx_notifications_deleted_at')
  @Column({ name: 'deleted_at', ...TIMESTAMP_NULLABLE })
  deletedAt: Date | null;
}

/**
 * `user_notifications_processed` — **the live delivery ledger** (484 rows).
 * Records which external service has already handled a notification.
 */
@Entity('user_notifications_processed')
export class UserNotificationProcessed {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  service: string;

  @Column({ name: 'processed_at', ...TIMESTAMP_NULLABLE })
  processedAt: Date | null;

  @Column({ name: 'notification_id', ...GORM_ID_NULLABLE })
  notificationId: number | null;
}

/**
 * `user_notifications_sent` — **dead table** (0 rows), superseded by
 * `user_notifications_processed`. Baseline-migration completeness only.
 */
@Entity('user_notifications_sent')
export class UserNotificationSentOrphan {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  service: string;

  @Column({ name: 'sent_at', ...TIMESTAMP_NULLABLE })
  sentAt: Date | null;

  @Column({ name: 'notification_id', ...GORM_ID_NULLABLE })
  notificationId: number | null;
}

/**
 * `app_notifications` — the source event queue (90 rows). No recipient; the
 * dispatcher fans these out into `user_notifications`.
 */
@Entity('app_notifications')
export class AppNotification {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ ...gormVarchar })
  app: string | null;

  @Column({ ...gormVarchar })
  type: string | null;

  @Index('item_id')
  @Column({ name: 'item_id', ...GORM_ID_NULLABLE })
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
 * `notification_settings` — per-user preferences (24 rows).
 *
 * ⚠️ The live table has **only** a primary key — no unique index on `userId`,
 * contrary to data-model.md. Duplicate rows per user are therefore possible and
 * the read path must pick deterministically rather than assume uniqueness.
 *
 * ⚠️ Wire keys differ from column names: `flow` ← `subscribed_to_flow`,
 * `boris` ← `subscribed_to_boris`, `comments` ← `subscribed_to_comments`.
 */
@Entity('notification_settings')
export class NotificationSettings {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'userId', ...GORM_ID_NULLABLE })
  userId: number | null;

  @Column({ name: 'enabled', ...gormBool({ default: 1 }) })
  enabled: boolean | null;

  @Column({ name: 'show_indicator', ...gormBool() })
  showIndicator: boolean | null;

  @Column({ name: 'send_telegram', ...gormBool() })
  sendTelegram: boolean | null;

  @Column({ name: 'send_email', ...gormBool() })
  sendEmail: boolean | null;

  @Column({ name: 'subscribed_to_flow', ...gormBool() })
  subscribedToFlow: boolean | null;

  @Column({ name: 'subscribed_to_boris', ...gormBool() })
  subscribedToBoris: boolean | null;

  @Column({ name: 'subscribed_to_comments', ...gormBool({ default: 1 }) })
  subscribedToComments: boolean | null;

  @Column({ name: 'last_seen', ...TIMESTAMP_NULLABLE })
  lastSeen: Date | null;

  @Column({ name: 'last_cleared', ...TIMESTAMP_NULLABLE })
  lastCleared: Date | null;

  @Column({ name: 'last_seen_notifications', ...TIMESTAMP_NULLABLE })
  lastSeenNotifications: Date | null;
}
