import { useCallback } from 'react';

import { TelegramUser } from '@v9v/ts-react-telegram-login';

import { apiAttachTelegram } from '../../api/auth/index';

export const useTelegramAccount = () => {
  const attach = useCallback((data: TelegramUser) => {
    apiAttachTelegram(data);
  }, []);

  return { attach };
};
