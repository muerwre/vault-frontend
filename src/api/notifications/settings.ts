import { API } from '~/constants/api';
import { NotificationSettings } from '~/types/notifications';
import { api, cleanResult } from '~/utils/api';
import {
  notificationSettingsFromRequest,
  notificationSettingsToRequest,
} from '~/utils/notifications/notificationSettingsFromRequest';

import {
  ApiGetNotificationSettingsResponse,
  ApiGetNotificationsResponse,
  ApiUpdateNotificationSettingsResponse,
} from './types';

export const apiGetNotificationSettings = (): Promise<NotificationSettings> =>
  api
    .get<ApiGetNotificationSettingsResponse>(API.NOTIFICATIONS.SETTINGS)
    .then(cleanResult)
    .then(notificationSettingsFromRequest);

export const apiGetNotifications = () =>
  api
    .get<ApiGetNotificationsResponse>(API.NOTIFICATIONS.LIST)
    .then(cleanResult);

export const apiUpdateNotificationSettings = (
  settings: Partial<NotificationSettings>,
) =>
  api
    .post<ApiUpdateNotificationSettingsResponse>(
      API.NOTIFICATIONS.SETTINGS,
      notificationSettingsToRequest(settings),
    )
    .then(cleanResult)
    .then(notificationSettingsFromRequest);
