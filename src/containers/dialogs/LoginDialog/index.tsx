import { FC, useCallback } from 'react';

import { LoginDialogButtons } from '~/components/auth/login/LoginDialogButtons';
import { LoginForm } from '~/components/auth/login/LoginForm';
import { LoginStaticScene } from '~/components/auth/login/LoginStaticScene';
import { Group } from '~/components/containers/Group';
import { Padder } from '~/components/containers/Padder';
import { BetterScrollDialog } from '~/components/dialogs/BetterScrollDialog';
import { DialogTitle } from '~/components/dialogs/DialogTitle';
import { Dialog } from '~/constants/modal';
import { useCloseOnEscape } from '~/hooks';
import { useAuth } from '~/hooks/auth/useAuth';
import { useOAuth } from '~/hooks/auth/useOAuth';
import { useShowModal } from '~/hooks/modal/useShowModal';
import { DialogComponentProps } from '~/types/modal';

import styles from './styles.module.scss';

type LoginDialogProps = DialogComponentProps & {};

const LoginDialog: FC<LoginDialogProps> = ({ onRequestClose }) => {
  useCloseOnEscape(onRequestClose);

  const { login } = useAuth();
  const { openOauthWindow } = useOAuth();
  const showRestoreDialog = useShowModal(Dialog.RestoreRequest);
  const onRestoreRequest = useCallback(() => {
    showRestoreDialog({});
  }, [showRestoreDialog]);

  return (
    <div>
      <BetterScrollDialog
        width={300}
        onClose={onRequestClose}
        footer={<LoginDialogButtons openOauthWindow={openOauthWindow} />}
        backdrop={<LoginStaticScene />}
      >
        <Padder>
          <div className={styles.wrap}>
            <Group>
              <DialogTitle>Решительно войти</DialogTitle>

              <LoginForm
                login={login}
                onRestoreRequest={onRestoreRequest}
                onSuccess={onRequestClose}
              />
            </Group>
          </div>
        </Padder>
      </BetterScrollDialog>
    </div>
  );
};

export { LoginDialog };
