import React, { FC, useCallback, useMemo } from 'react';

import { TelegramUser } from '@v9v/ts-react-telegram-login';

import { Padder } from '~/components/containers/Padder';
import { Button } from '~/components/input/Button';
import { useTelegramAccount } from '~/hooks/auth/useTelegramAccount';
import { DialogComponentProps } from '~/types/modal';

import { TelegramLoginForm } from '../../../components/auth/oauth/TelegramLoginForm/index';
import { BetterScrollDialog } from '../../../components/dialogs/BetterScrollDialog';

interface TelegramAttachDialogProps extends DialogComponentProps {}

const botName = process.env.NEXT_PUBLIC_BOT_USERNAME;

const TelegramAttachDialog: FC<TelegramAttachDialogProps> = ({
  onRequestClose,
}) => {
  const { attach } = useTelegramAccount();

  const onAttach = useCallback(
    (data: TelegramUser) => attach(data, onRequestClose),
    [onRequestClose],
  );

  const buttons = useMemo(
    () => (
      <Padder>
        <Button stretchy onClick={onRequestClose}>
          Отмена
        </Button>
      </Padder>
    ),
    [onRequestClose],
  );

  if (!botName) {
    onRequestClose();
    return null;
  }

  return (
    <BetterScrollDialog width={300} onClose={onRequestClose} footer={buttons}>
      <TelegramLoginForm botName={botName} onSuccess={onAttach} />
    </BetterScrollDialog>
  );
};
export { TelegramAttachDialog };
