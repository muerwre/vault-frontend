import React, { FC } from 'react';

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

  if (!botName) {
    // TODO: show something
    return null;
  }

  return (
    <BetterScrollDialog width={300} onClose={onRequestClose}>
      <div>
        <TelegramLoginForm botName={botName} onSuccess={attach} />
      </div>
    </BetterScrollDialog>
  );
};
export { TelegramAttachDialog };
