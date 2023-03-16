import { useCallback, useState } from 'react';

import { isValid, parseISO } from 'date-fns';
import useSWR from 'swr';

import {
  apiGetNotificationSettings,
  apiUpdateNotificationSettings,
} from '~/api/notifications/settings';
import { API } from '~/constants/api';
import { NotificationSettings } from '~/types/notifications';
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
    apiGetNotificationSettings,
    { refreshInterval },
  );

  const update = useCallback(
    async (settings: Partial<NotificationSettings>) => {
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
      data?.lastSeen && isValid(parseISO(data.lastSeen))
        ? parseISO(data?.lastSeen)
        : undefined,
    lastDate:
      data?.lastDate && isValid(parseISO(data.lastDate))
        ? parseISO(data?.lastDate)
        : undefined,
    enabled: !!data?.enabled && (data.flow || data.comments),
    settings: data,
    refresh,
    update,
    updateError,
    isUpdating,
  };
};
