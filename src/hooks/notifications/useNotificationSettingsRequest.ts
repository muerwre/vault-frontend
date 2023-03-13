import { useCallback, useState } from 'react';

import { isValid, parseISO } from 'date-fns';
import useSWR from 'swr';

import {
  apiGetNotificationSettings,
  apiUpdateNotificationSettings,
} from '~/api/notifications/settings';
import { ApiUpdateNotificationSettingsRequest } from '~/api/notifications/types';
import { API } from '~/constants/api';
import { getErrorMessage } from '~/utils/errors/getErrorMessage';
import { showErrorToast } from '~/utils/errors/showToast';

import { useAuth } from '../auth/useAuth';

const refreshInterval = 60e3; // 1min

export const useNotificationSettingsRequest = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const { isUser } = useAuth();
  const {
    data,
    isValidating: isLoading,
    error,
    mutate,
  } = useSWR(
    isUser ? API.NOTIFICATIONS.SETTINGS : null,
    async () => apiGetNotificationSettings(),
    { refreshInterval },
  );

  const update = useCallback(
    async (settings: ApiUpdateNotificationSettingsRequest) => {
      if (!data) {
        return;
      }

      try {
        setIsUpdating(true);
        setUpdateError('');

        mutate({ ...data, ...settings }, { revalidate: false });

        const result = await apiUpdateNotificationSettings(settings);

        mutate(result, { revalidate: false });
      } catch (error) {
        mutate(data, { revalidate: false });

        const message = getErrorMessage(error);
        if (message) {
          setUpdateError(message);
        }

        showErrorToast(error);
      } finally {
        setIsUpdating(true);
      }
    },
    [data, mutate],
  );

  const refresh = useCallback(() => mutate(), [mutate]);

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
    refresh,
    update,
    updateError,
    isUpdating,
  };
};
