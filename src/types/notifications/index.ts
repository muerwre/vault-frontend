import { ShallowUser } from '../auth';

export interface NotificationItem {
  id: number;
  url: string;
  type: NotificationType;
  title: string;
  text: string;
  user: ShallowUser;
  thumbnail: string;
  created_at: string;
}

export enum NotificationType {
  Node = 'node',
  Comment = 'comment',
  Boris = 'boris',
}

export interface NotificationSettings {
  enabled: boolean;
  flow: boolean;
  boris: boolean;
  comments: boolean;
  sendTelegram: boolean;
  showIndicator: boolean;
  lastSeen: string | null;
  lastDate: string | null;
}
