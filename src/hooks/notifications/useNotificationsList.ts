import useSWR from 'swr';

import { apiGetNotifications } from '~/api/notifications/settings';
import { API } from '~/constants/api';

import { useAuth } from '../auth/useAuth';

export const useNotificationsList = () => {
  const { isUser } = useAuth();

  const {
    data,
    isValidating: isLoading,
    error,
  } = useSWR(isUser ? API.NOTIFICATIONS.LIST : null, async () =>
    apiGetNotifications(),
  );

  return { isLoading, error, ...data };
};
