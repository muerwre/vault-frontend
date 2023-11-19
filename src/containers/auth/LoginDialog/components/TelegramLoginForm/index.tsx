import React, { FC } from 'react';

import TelegramLoginButton, {
  TelegramUser,
} from '@v9v/ts-react-telegram-login';

import { LoaderCircle } from '~/components/input/LoaderCircle';

import styles from './styles.module.scss';

interface TelegramLoginFormProps {
  botName: string;
  loading?: boolean;
  onSuccess?: (token: TelegramUser) => void;
}

const TelegramLoginForm: FC<TelegramLoginFormProps> = ({
  botName,
  loading,
  onSuccess,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.text}>
        {loading ? (
          <LoaderCircle />
        ) : (
          <div>
            После успешной авторизации аккаунт появится в настройках вашего
            профиля
          </div>
        )}
      </div>

      <div className={styles.button}>
        <TelegramLoginButton
          dataOnAuth={onSuccess}
          botName={botName}
          requestAccess
        />
      </div>
    </div>
  );
};

export { TelegramLoginForm };
