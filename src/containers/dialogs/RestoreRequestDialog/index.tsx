import React, { FC, useCallback, useEffect, useMemo, useState, VFC } from 'react';
import { connect, useDispatch } from 'react-redux';
import { BetterScrollDialog } from '../BetterScrollDialog';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import { Button } from '~/components/input/Button';
import styles from './styles.module.scss';

import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { selectAuthRestore } from '~/redux/auth/selectors';
import { ERROR_LITERAL } from '~/constants/errors';
import { Icon } from '~/components/input/Icon';
import { useCloseOnEscape } from '~/hooks';
import { IDialogProps } from '~/types/modal';
import { useShallowSelect } from '~/hooks/data/useShallowSelect';
import { IAuthState } from '~/redux/auth/types';

interface RestoreRequestDialogProps extends IDialogProps {}

const RestoreRequestDialog: VFC<RestoreRequestDialogProps> = ({ onRequestClose }) => {
  const dispatch = useDispatch();
  const { error, is_loading, is_succesfull } = useShallowSelect(selectAuthRestore);
  const [field, setField] = useState('');

  const authSetRestore = useCallback(
    (restore: Partial<IAuthState['restore']>) => dispatch(AUTH_ACTIONS.authSetRestore(restore)),
    [dispatch]
  );

  const authRequestRestoreCode = useCallback(
    (field: string) => dispatch(AUTH_ACTIONS.authRequestRestoreCode(field)),
    [dispatch]
  );

  const onSubmit = useCallback(
    event => {
      event.preventDefault();

      if (!field) return;

      authRequestRestoreCode(field);
    },
    [authRequestRestoreCode, field]
  );

  useEffect(() => {
    if (error || is_succesfull) {
      authSetRestore({ error: '', is_succesfull: false });
    }
  }, [authSetRestore, error, field, is_succesfull]);

  const buttons = useMemo(
    () => (
      <Group className={styles.buttons}>
        <Button>Восстановить</Button>
      </Group>
    ),
    []
  );

  const header = useMemo(() => <div className={styles.illustration} />, []);

  const overlay = useMemo(
    () =>
      is_succesfull ? (
        <Group className={styles.shade}>
          <Icon icon="check" size={64} />

          <div>Проверьте почту, мы отправили на неё код</div>

          <div />

          <Button color="secondary" onClick={onRequestClose}>
            Отлично!
          </Button>
        </Group>
      ) : (
        undefined
      ),
    [is_succesfull, onRequestClose]
  );

  useCloseOnEscape(onRequestClose);

  return (
    <form onSubmit={onSubmit}>
      <BetterScrollDialog
        header={header}
        footer={buttons}
        width={300}
        onClose={onRequestClose}
        is_loading={is_loading}
        error={error && ERROR_LITERAL[error]}
        overlay={overlay}
      >
        <div className={styles.wrap}>
          <Group>
            <InputText title="Имя или email" value={field} handler={setField} autoFocus />

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
