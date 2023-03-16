import { ApiGetNotificationSettingsResponse } from '~/api/notifications/types';
import { NotificationSettings } from '~/types/notifications';

import { ApiUpdateNotificationSettingsRequest } from '../../api/notifications/types';

export const notificationSettingsFromRequest = (
  req: ApiGetNotificationSettingsResponse,
): NotificationSettings => ({
  enabled: req.enabled,
  flow: req.flow,
  comments: req.comments,
  sendTelegram: req.send_telegram,
  showIndicator: req.show_indicator,
  lastDate: req.last_date ?? null,
  lastSeen: req.last_seen ?? null,
});

export const notificationSettingsToRequest = (
  req: Partial<NotificationSettings>,
): ApiUpdateNotificationSettingsRequest => ({
  enabled: req.enabled,
  flow: req.flow,
  comments: req.comments,
  send_telegram: req.sendTelegram,
  show_indicator: req.showIndicator,
  last_date: req.lastDate,
  last_seen: req.lastSeen,
});
