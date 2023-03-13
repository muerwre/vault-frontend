import React, { FC, useEffect } from 'react';

import TelegramLoginButton, {
  TelegramUser,
} from '@v9v/ts-react-telegram-login';

interface TelegramLoginFormProps {
  botName: string;
  onSuccess?: (token: TelegramUser) => void;
}

const TelegramLoginForm: FC<TelegramLoginFormProps> = ({
  botName,
  onSuccess,
}) => {
  return (
    <TelegramLoginButton
      dataOnAuth={onSuccess}
      botName={botName}
      requestAccess
    />
  );
};

export { TelegramLoginForm };
