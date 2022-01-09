import React, { FC, useCallback } from 'react';
import { useCloseOnEscape } from '~/hooks';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import { Button } from '~/components/input/Button';
import { Padder } from '~/components/containers/Padder';
import { BetterScrollDialog } from '~/components/dialogs/BetterScrollDialog';

import styles from './styles.module.scss';
import { LoginDialogButtons } from '~/components/auth/login/LoginDialogButtons';
import { DialogTitle } from '~/components/dialogs/DialogTitle';
import { DialogComponentProps } from '~/types/modal';
import { useShowModal } from '~/hooks/modal/useShowModal';
import { Dialog } from '~/constants/modal';
import { useAuth } from '~/hooks/auth/useAuth';
import { useLoginForm } from '~/hooks/auth/useLoginForm';
import { useOAuth } from '~/hooks/auth/useOAuth';

type LoginDialogProps = DialogComponentProps & {};

const LoginDialog: FC<LoginDialogProps> = ({ onRequestClose }) => {
  useCloseOnEscape(onRequestClose);

  const { login } = useAuth();
  const { openOauthWindow } = useOAuth();
  const showRestoreDialog = useShowModal(Dialog.RestoreRequest);
  const onRestoreRequest = useCallback(
    event => {
      event.preventDefault();
      showRestoreDialog({});
    },
    [showRestoreDialog]
  );

  const { values, errors, handleSubmit, handleChange } = useLoginForm(login, onRequestClose);

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <BetterScrollDialog
          width={300}
          onClose={onRequestClose}
          footer={<LoginDialogButtons openOauthWindow={openOauthWindow} />}
          backdrop={<div className={styles.backdrop} />}
        >
          <Padder>
            <div className={styles.wrap}>
              <Group>
                <DialogTitle>Решительно войти</DialogTitle>

                <InputText
                  title="Логин"
                  handler={handleChange('username')}
                  value={values.username}
                  error={errors.username}
                  autoFocus
                />

                <InputText
                  title="Пароль"
                  handler={handleChange('password')}
                  value={values.password}
                  error={errors.password}
                  type="password"
                />

                <Button
                  color="link"
                  type="button"
                  onClick={onRestoreRequest}
                  className={styles.forgot_button}
                >
                  Вспомнить пароль
                </Button>
              </Group>
            </div>
          </Padder>
        </BetterScrollDialog>
      </div>
    </form>
  );
};

export { LoginDialog };
