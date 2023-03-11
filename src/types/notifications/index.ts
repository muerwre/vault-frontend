import { ShallowUser } from '../auth';

export interface NotificationItem {
  id: number;
  url: string;
  type: NotificationType;
  text: string;
  user: ShallowUser;
  thumbnail: string;
  created_at: string;
}

export enum NotificationType {
  Node = 'node',
  Comment = 'comment',
}
