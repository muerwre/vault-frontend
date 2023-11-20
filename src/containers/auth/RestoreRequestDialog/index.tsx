import React, { useCallback, useMemo, useState, VFC } from 'react';

import { apiRequestRestoreCode } from '~/api/auth';
import { Group } from '~/components/common/Group';
import { Button } from '~/components/input/Button';
import { InputText } from '~/components/input/InputText';
import { useCloseOnEscape } from '~/hooks';
import { useRestoreRequestForm } from '~/hooks/auth/useRestoreRequestForm';
import { DialogComponentProps } from '~/types/modal';

import { BetterScrollDialog } from '../../../components/common/BetterScrollDialog';

import { RestoreSent } from './components/RestoreSent';
import styles from './styles.module.scss';

interface RestoreRequestDialogProps extends DialogComponentProps {}

const RestoreRequestDialog: VFC<RestoreRequestDialogProps> = ({
  onRequestClose,
}) => {
  useCloseOnEscape(onRequestClose);

  const [isSent, setIsSent] = useState(false);
  const onSent = useCallback(() => setIsSent(true), [setIsSent]);

  const { isSubmitting, handleSubmit, handleChange, errors, values } =
    useRestoreRequestForm(apiRequestRestoreCode, onSent);

  const buttons = useMemo(
    () => (
      <Group className={styles.buttons}>
        <Button>Восстановить</Button>
      </Group>
    ),
    [],
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
              Введите имя пользователя или адрес почты. Мы пришлем ссылку для
              сброса пароля.
            </div>
          </Group>
        </div>
      </BetterScrollDialog>
    </form>
  );
};

export { RestoreRequestDialog };
