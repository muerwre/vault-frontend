import type { IComment, IMessage } from './comment';

export interface IMessageNotification {
  type: 'message';
  content: Partial<IMessage>;
  created_at: string;
}

export interface ICommentNotification {
  type: 'comment';
  content: Partial<IComment>;
  created_at: string;
}

export type INotification = IMessageNotification | ICommentNotification;

/** `itemId` is camelCase on the wire, unlike its neighbours. */
export interface INotificationItem {
  type: string;
  itemId: number;
  time: string;
}

/**
 * `GET/POST /notifications/settings` payload. snake_case on the wire, and the
 * keys do not match column names one-to-one:
 *
 * | wire       | column                  |
 * |------------|-------------------------|
 * | `flow`     | `subscribed_to_flow`    |
 * | `boris`    | `subscribed_to_boris`   |
 * | `comments` | `subscribed_to_comments`|
 */
export interface INotificationSettings {
  enabled: boolean;
  show_indicator: boolean;
  send_telegram: boolean;
  send_email: boolean;
  flow: boolean;
  boris: boolean;
  comments: boolean;
}
