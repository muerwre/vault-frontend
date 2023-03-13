import { useCallback, useState } from 'react';

import { TelegramUser } from '@v9v/ts-react-telegram-login';

import { showErrorToast } from '~/utils/errors/showToast';

import { apiAttachTelegram } from '../../api/auth/index';

import { useOAuth } from './useOAuth';

export const useTelegramAccount = () => {
  const [loading, setLoading] = useState(false);
  const { refresh } = useOAuth();

  const attach = useCallback(
    async (data: TelegramUser, callback?: () => void) => {
      setLoading(true);
      try {
        await apiAttachTelegram(data);
        await refresh();
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
