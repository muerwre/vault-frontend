/** Item kinds stored in `user_notifications.type`. */
export const NOTIFICATION_ITEM_TYPES = {
  NODE: 'node',
  COMMENT: 'comment',
  BORIS: 'boris',
} as const;

export type NotificationItemType =
  (typeof NOTIFICATION_ITEM_TYPES)[keyof typeof NOTIFICATION_ITEM_TYPES];

/** Event kinds pushed onto the `app_notifications` source queue. */
export const NOTIFICATION_QUEUE_TYPES = {
  NODE_CREATE: 'node_create',
  NODE_DELETE: 'node_delete',
  NODE_RESTORE: 'node_restore',
  COMMENT_CREATE: 'comment_create',
  COMMENT_DELETE: 'comment_delete',
  COMMENT_RESTORE: 'comment_restore',
} as const;

export type NotificationQueueType =
  (typeof NOTIFICATION_QUEUE_TYPES)[keyof typeof NOTIFICATION_QUEUE_TYPES];

/**
 * Wire kinds the frontend switches on in the notification feed
 * (`packages/frontend/src/types` `NOTIFICATION_TYPES`). Note `message` appears
 * here but not in the DB `type` column.
 */
export const NOTIFICATION_WIRE_TYPES = {
  MESSAGE: 'message',
  COMMENT: 'comment',
  NODE: 'node',
} as const;
