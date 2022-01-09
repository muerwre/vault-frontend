import React, { useCallback, useMemo, useState, VFC } from 'react';
import { BetterScrollDialog } from '../../../components/dialogs/BetterScrollDialog';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import { Button } from '~/components/input/Button';
import styles from './styles.module.scss';
import { useCloseOnEscape } from '~/hooks';
import { DialogComponentProps } from '~/types/modal';
import { useRestoreRequestForm } from '~/hooks/auth/useRestoreRequestForm';
import { apiRequestRestoreCode } from '~/api/auth';
import { RestoreSent } from '~/components/auth/restore/RestoreSent';

interface RestoreRequestDialogProps extends DialogComponentProps {}

const RestoreRequestDialog: VFC<RestoreRequestDialogProps> = ({ onRequestClose }) => {
  useCloseOnEscape(onRequestClose);

  const [isSent, setIsSent] = useState(false);
  const onSent = useCallback(() => setIsSent(true), [setIsSent]);

  const { isSubmitting, handleSubmit, handleChange, errors, values } = useRestoreRequestForm(
    apiRequestRestoreCode,
    onSent
  );

  const buttons = useMemo(
    () => (
      <Group className={styles.buttons}>
        <Button color="secondary">Восстановить</Button>
      </Group>
    ),
    []
  );

  const header = useMemo(() => <div className={styles.illustration} />, []);

  return (
    <form onSubmit={handleSubmit}>
      <BetterScrollDialog
        header={header}
        footer={buttons}
        width={300}
        onClose={onRequestClose}
        is_loading={isSubmitting}
        overlay={isSent ? <RestoreSent onClose={onRequestClose} /> : undefined}
      >
        <div className={styles.wrap}>
          <Group>
            <InputText
              title="Имя или email"
              value={values.field}
              handler={handleChange('field')}
              error={errors.field}
              autoFocus
            />

            <div className={styles.text}>
              Введите имя пользователя или адрес почты. Мы пришлем ссылку для сброса пароля.
            </div>
          </Group>
        </div>
      </BetterScrollDialog>
    </form>
  );
};

export { RestoreRequestDialog };
