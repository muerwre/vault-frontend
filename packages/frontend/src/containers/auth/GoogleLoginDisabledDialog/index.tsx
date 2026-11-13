import { FC, useCallback } from 'react';

import { BetterScrollDialog } from '~/components/common/BetterScrollDialog';
import { Group } from '~/components/common/Group';
import { Button } from '~/components/input/Button';
import { Dialog } from '~/constants/modal';
import { useCloseOnEscape } from '~/hooks';
import { useShowModal } from '~/hooks/modal/useShowModal';
import { DialogComponentProps } from '~/types/modal';

import styles from './styles.module.scss';

type GoogleLoginDisabledDialogProps = DialogComponentProps & {};

/**
 * Google sign-in is retired. Accounts registered through it were asked for a
 * password at signup, so they can still log in with their username and
 * password, or restore the password by email.
 */
const GoogleLoginDisabledDialog: FC<GoogleLoginDisabledDialogProps> = ({
  onRequestClose,
}) => {
  useCloseOnEscape(onRequestClose);

  const showRestoreDialog = useShowModal(Dialog.RestoreRequest);
  const onRestoreRequest = useCallback(() => {
    showRestoreDialog({});
  }, [showRestoreDialog]);

  const showLoginDialog = useShowModal(Dialog.Login);
  const onLogin = useCallback(() => {
    showLoginDialog({});
  }, [showLoginDialog]);

  const footer = (
    <Group className={styles.buttons}>
      <Button type="button" onClick={onLogin}>
        Войти
      </Button>
    </Group>
  );

  return (
    <BetterScrollDialog width={300} onClose={onRequestClose} footer={footer}>
      <div className={styles.wrap}>
        <div className={styles.text}>
          Этот способ входа больше не доступен, используйте логин и пароль,
          указанные при регистрации, или{' '}
          <button
            type="button"
            className={styles.link}
            onClick={onRestoreRequest}
          >
            восстановите пароль
          </button>
          .
        </div>
      </div>
    </BetterScrollDialog>
  );
};

export { GoogleLoginDisabledDialog };
