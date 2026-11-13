import { useCallback, useState } from 'react';

import useSWR from 'swr';

import {
  apiGetNotificationSettings,
  apiUpdateNotificationSettings,
} from '~/api/notifications/settings';
import { API } from '~/constants/api';
import { NotificationSettings } from '~/types/notifications';
import { showErrorToast } from '~/utils/errors/showToast';

import { useAuth } from '../auth/useAuth';

/** Switching on also subscribes to the posts and comments it is meant for. */
const TURN_ON: Partial<NotificationSettings> = {
  enabled: true,
  sendTelegram: true,
  flow: true,
  comments: true,
};

const TURN_OFF: Partial<NotificationSettings> = { sendTelegram: false };

/**
 * Telegram delivery of post and comment notifications. Reads the settings on
 * its own, since the notifications feature flag stops the shared settings
 * request from running.
 */
export const useTelegramNotifications = () => {
  const { isUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data, mutate } = useSWR(
    isUser ? API.NOTIFICATIONS.SETTINGS : null,
    apiGetNotificationSettings,
  );

  const enabled =
    !!data?.enabled && !!data.sendTelegram && (data.flow || data.comments);

  const setEnabled = useCallback(
    async (value: boolean) => {
      if (!data) {
        return;
      }

      const patch = value ? TURN_ON : TURN_OFF;

      try {
        setIsUpdating(true);
        mutate({ ...data, ...patch }, { revalidate: false });
        mutate(await apiUpdateNotificationSettings(patch), {
          revalidate: false,
        });
      } catch (error) {
        mutate(data, { revalidate: false });
        showErrorToast(error);
      } finally {
        setIsUpdating(false);
      }
    },
    [data, mutate],
  );

  return { enabled, isLoading: !data, isUpdating, setEnabled };
};
