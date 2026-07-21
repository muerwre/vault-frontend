import { useCallback, useMemo, useState } from 'react';

import { TelegramUser } from '@v9v/ts-react-telegram-login';

import { Dialog } from '~/constants/modal';
import { showErrorToast } from '~/utils/errors/showToast';
import { useNotifications } from '~/utils/providers/NotificationProvider';

import { apiAttachTelegram } from '../../api/auth/index';
import { useModal } from '../modal/useModal';

import { useOAuth } from './useOAuth';

export const useTelegramAccount = () => {
  const [loading, setLoading] = useState(false);
  const { refresh, accounts } = useOAuth();
  const { refresh: refreshNotificationSettings } = useNotifications();
  const { showModal } = useModal();

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
    [refresh, refreshNotificationSettings],
  );

  const connect = useCallback(
    () => showModal(Dialog.TelegramAttach, {}),
    [showModal],
  );

  const connected = useMemo(
    () => accounts.some((it) => it.provider === 'telegram'),
    [accounts],
  );

  return { attach, loading, connected, connect };
};
