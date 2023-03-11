import { API } from '~/constants/api';
import { api, cleanResult } from '~/utils/api';

import {
  ApiGetNotificationSettingsResponse,
  ApiGetNotificationsResponse,
} from './types';

export const apiGetNotificationSettings = () =>
  api
    .get<ApiGetNotificationSettingsResponse>(API.NOTIFICATIONS.SETTINGS)
    .then(cleanResult);

export const apiGetNotifications = () =>
  api
    .get<ApiGetNotificationsResponse>(API.NOTIFICATIONS.LIST)
    .then(cleanResult);
