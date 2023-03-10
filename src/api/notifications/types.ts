import { NotificationItem } from '~/types/notifications';

export interface ApiGetNotificationSettingsResponse {
  enabled: boolean;
  flow: boolean;
  comments: boolean;
  last_seen?: string | null;
  last_date?: string | null;
}

export interface ApiGetNotificationsResponse {
  items?: NotificationItem[];
}
