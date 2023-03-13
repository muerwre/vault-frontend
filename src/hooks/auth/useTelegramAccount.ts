import { useCallback, useState } from 'react';

import { TelegramUser } from '@v9v/ts-react-telegram-login';

import { showErrorToast } from '~/utils/errors/showToast';
import { useNotifications } from '~/utils/providers/NotificationProvider';

import { apiAttachTelegram } from '../../api/auth/index';

import { useOAuth } from './useOAuth';

export const useTelegramAccount = () => {
  const [loading, setLoading] = useState(false);
  const { refresh } = useOAuth();
  const { refresh: refreshNotificationSettings } = useNotifications();

  const attach = useCallback(
    async (data: TelegramUser, callback?: () => void) => {
      setLoading(true);
      try {
        await apiAttachTelegram(data);
        await Promise.all([refresh(), refreshNotificationSettings()]);
        callback?.();
      } catch (error) {
        showErrorToast(error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { attach, loading };
};
