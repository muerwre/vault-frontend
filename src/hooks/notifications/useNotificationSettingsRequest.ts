import { isValid, parseISO } from 'date-fns';
import useSWR from 'swr';

import { apiGetNotificationSettings } from '~/api/notifications/settings';
import { API } from '~/constants/api';

import { useAuth } from '../auth/useAuth';

const refreshInterval = 60e3; // 1min

export const useNotificationSettingsRequest = () => {
  const { isUser } = useAuth();
  const {
    data,
    isValidating: isLoading,
    error,
  } = useSWR(
    isUser ? API.NOTIFICATIONS.SETTINGS : null,
    async () => apiGetNotificationSettings(),
    { refreshInterval },
  );

  return {
    isLoading,
    error,
    lastSeen:
      data?.last_seen && isValid(parseISO(data.last_seen))
        ? parseISO(data?.last_seen)
        : undefined,
    lastDate:
      data?.last_date && isValid(parseISO(data.last_date))
        ? parseISO(data?.last_date)
        : undefined,
    enabled: !!data?.enabled && (data.flow || data.comments),
  };
};
