import { FC, useCallback, useRef } from 'react';

import { BetterScrollDialog } from '~/components/common/BetterScrollDialog';
import { DialogTitle } from '~/components/common/DialogTitle';
import { Group } from '~/components/common/Group';
import { Padder } from '~/components/common/Padder';
import { Button } from '~/components/input/Button';
import { InputText } from '~/components/input/InputText';
import { Dialog } from '~/constants/modal';
import { LoginDialogButtons } from '~/containers/auth/LoginDialog/components/LoginDialogButtons';
import { LoginStaticScene } from '~/containers/auth/LoginDialog/components/LoginStaticScene';
import { useCloseOnEscape } from '~/hooks';
import { useAuth } from '~/hooks/auth/useAuth';
import { useLoginForm } from '~/hooks/auth/useLoginForm';
import { useOAuth } from '~/hooks/auth/useOAuth';
import { useShowModal } from '~/hooks/modal/useShowModal';
import { DialogComponentProps } from '~/types/modal';

import styles from './styles.module.scss';

type LoginDialogProps = DialogComponentProps & {};

const LoginDialog: FC<LoginDialogProps> = ({ onRequestClose }) => {
  const feature = useRef<'clouds' | 'nowhere'>(
    Math.random() <= 0.5 ? 'clouds' : 'nowhere',
  ).current;

  useCloseOnEscape(onRequestClose);

  const { login } = useAuth();
  const { openOauthWindow } = useOAuth();
  const showRestoreDialog = useShowModal(Dialog.RestoreRequest);
  const onRestoreRequest = useCallback(() => {
    showRestoreDialog({});
  }, [showRestoreDialog]);

  const backdrop = <LoginStaticScene scene={feature} />;

  const { values, errors, handleSubmit, handleChange } = useLoginForm(
    login,
    onRequestClose,
  );

  return (
    <form onSubmit={handleSubmit}>
      <BetterScrollDialog
        width={300}
        onClose={onRequestClose}
        footer={<LoginDialogButtons openOauthWindow={openOauthWindow} />}
        backdrop={backdrop}
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
    </form>
  );
};

export { LoginDialog };
