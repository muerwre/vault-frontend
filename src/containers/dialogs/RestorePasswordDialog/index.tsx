import React, { FC, useCallback, useMemo, useState } from 'react';
import { BetterScrollDialog } from '../../../components/dialogs/BetterScrollDialog';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import { Button } from '~/components/input/Button';
import styles from './styles.module.scss';

import { useCloseOnEscape } from '~/hooks';
import { DialogComponentProps } from '~/types/modal';
import { useRestoreCode } from '~/hooks/auth/useRestoreCode';
import { RestoreInvalidCode } from '~/components/auth/restore/RestoreInvalidCode';
import { RestoreSuccess } from '~/components/auth/restore/RestoreSuccess';
import { useRestorePasswordForm } from '~/hooks/auth/useRestorePasswordForm';
import { apiRestoreCode } from '~/api/auth';

type RestorePasswordDialogProps = DialogComponentProps & {
  code: string;
};

const RestorePasswordDialog: FC<RestorePasswordDialogProps> = ({ onRequestClose, code }) => {
  useCloseOnEscape(onRequestClose);

  const { codeUser, isLoading, error } = useRestoreCode(code);

  const [isSent, setIsSent] = useState(false);
  const onSent = useCallback(() => setIsSent(true), [setIsSent]);

  const { handleChange, handleSubmit, values, errors } = useRestorePasswordForm(
    code,
    apiRestoreCode,
    onSent
  );

  const buttons = useMemo(
    () => (
      <Group className={styles.buttons}>
        <Button color="primary">Восстановить</Button>
      </Group>
    ),
    []
  );

  const overlay = useMemo(() => {
    if (isSent) {
      return <RestoreSuccess username={codeUser?.username} onClick={onRequestClose} />;
    }

    if (error) {
      return <RestoreInvalidCode onClose={onRequestClose} error={error} />;
    }

    if (isLoading) {
      return <div className={styles.shade} />;
    }
  }, [isLoading, error, isSent, codeUser, onRequestClose]);

  return (
    <form onSubmit={handleSubmit}>
      <BetterScrollDialog
        footer={buttons}
        overlay={overlay}
        width={300}
        onClose={onRequestClose}
        is_loading={isLoading}
      >
        <div className={styles.wrap}>
          <Group>
            <div className={styles.header}>Пришло время сменить пароль, {codeUser?.username}</div>

            <InputText
              title="Новый пароль"
              value={values.newPassword}
              handler={handleChange('newPassword')}
              error={errors.newPassword}
              autoFocus
              type="password"
            />

            <InputText
              title="Ещё раз"
              type="password"
              value={values.newPasswordAgain}
              handler={handleChange('newPasswordAgain')}
              error={errors.newPasswordAgain}
            />

            <Group className={styles.text}>
              <p>Новый пароль должен быть не короче 6 символов.</p>
              <p>
                Вряд ли кто-нибудь будет пытаться нас взломать, но сложный пароль всегда лучше
                простого.
              </p>
            </Group>
          </Group>
        </div>
      </BetterScrollDialog>
    </form>
  );
};

export { RestorePasswordDialog };
