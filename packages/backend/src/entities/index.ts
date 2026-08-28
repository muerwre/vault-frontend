import { Comment } from './comment.entity';
import { Embed } from './embed.entity';
import { File } from './file.entity';
import { CommentLikesOrphan, CommentUserLike, Like } from './like.entity';
import { Message } from './message.entity';
import { NodeSocialPublication, NodeWatch } from './node-extras.entity';
import { Node } from './node.entity';
import {
  AppNotification,
  NotificationSettings,
  NotificationsOrphan,
  UserNotification,
  UserNotificationProcessed,
  UserNotificationSentOrphan,
} from './notification.entity';
import { RestoreCode, Social } from './social.entity';
import { Tag } from './tag.entity';
import { Token } from './token.entity';
import { User } from './user.entity';
import { MessageView, NodeView } from './views.entity';

export * from './columns';
export * from './comment.entity';
export * from './embed.entity';
export * from './file.entity';
export * from './like.entity';
export * from './message.entity';
export * from './node-extras.entity';
export * from './node.entity';
export * from './notification.entity';
export * from './social.entity';
export * from './tag.entity';
export * from './token.entity';
export * from './user.entity';
export * from './views.entity';

/**
 * Every entity, listed explicitly — globs break under ncc bundling.
 *
 * Covers all 27 tables, including the dead ones, so `migration:generate` can
 * prove zero drift against the full schema.
 */
export const ENTITIES = [
  // legacy dialect (utf8mb3, int(11), FKs)
  User,
  Node,
  Comment,
  File,
  Tag,
  Message,
  Social,
  RestoreCode,
  Token,
  Like,
  NodeView,
  MessageView,
  Embed,
  // modern dialect (utf8mb4, int(10) unsigned, no FKs)
  CommentUserLike,
  CommentLikesOrphan,
  UserNotification,
  NotificationsOrphan,
  UserNotificationProcessed,
  UserNotificationSentOrphan,
  AppNotification,
  NotificationSettings,
  NodeSocialPublication,
  NodeWatch,
];
