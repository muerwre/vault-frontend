import React, { FC, useCallback } from 'react';

import { LoginDialogButtons } from '~/components/auth/login/LoginDialogButtons';
import { Group } from '~/components/containers/Group';
import { Padder } from '~/components/containers/Padder';
import { BetterScrollDialog } from '~/components/dialogs/BetterScrollDialog';
import { DialogTitle } from '~/components/dialogs/DialogTitle';
import { Button } from '~/components/input/Button';
import { InputText } from '~/components/input/InputText';
import { Dialog } from '~/constants/modal';
import { useCloseOnEscape } from '~/hooks';
import { useAuth } from '~/hooks/auth/useAuth';
import { useLoginForm } from '~/hooks/auth/useLoginForm';
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
