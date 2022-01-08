import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { BetterScrollDialog } from '../BetterScrollDialog';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import { Button } from '~/components/input/Button';
import styles from './styles.module.scss';

import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { pick } from 'ramda';
import { selectAuthRestore } from '~/redux/auth/selectors';
import { ERROR_LITERAL, ERRORS } from '~/constants/errors';
import { Icon } from '~/components/input/Icon';
import { useCloseOnEscape } from '~/hooks';
import { DialogComponentProps } from '~/types/modal';

const mapStateToProps = state => ({
  restore: selectAuthRestore(state),
});

const mapDispatchToProps = pick(['authRestorePassword', 'authSetRestore'], AUTH_ACTIONS);

type IProps = DialogComponentProps &
  ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {};

const RestorePasswordDialogUnconnected: FC<IProps> = ({
  restore: { error, is_loading, is_succesfull, user },
  authSetRestore,
  onRequestClose,
  authRestorePassword,
}) => {
  const [password, setPassword] = useState('');
  const [password_again, setPasswordAgain] = useState('');

  const doesnt_match = useMemo(
    () => !password || !password_again || password.trim() !== password_again.trim(),
    [password_again, password]
  );

  const onSubmit = useCallback(
    event => {
      event.preventDefault();

      if (doesnt_match) return;

      authRestorePassword(password);
    },
    [doesnt_match, authRestorePassword, password]
  );

  useEffect(() => {
    if (error || is_succesfull) {
      authSetRestore({ error: '', is_succesfull: false });
    }
  }, [authSetRestore, error, is_succesfull, password, password_again]);

  const buttons = useMemo(
    () => (
      <Group className={styles.buttons}>
        <Button color={doesnt_match ? 'outline' : 'primary'}>Восстановить</Button>
      </Group>
    ),
    [doesnt_match]
  );

  const overlay = useMemo(
    () =>
      is_succesfull ? (
        <Group className={styles.shade}>
          <Icon icon="check" size={64} />

          <div>Пароль обновлен</div>
          <div>Добро пожаловать домой, ~{user?.username}!</div>

          <div />

          <Button color="secondary" onClick={onRequestClose}>
            Ура!
          </Button>
        </Group>
      ) : (
        undefined
      ),
    [is_succesfull, onRequestClose, user]
  );

  const not_ready = useMemo(
    () => (is_loading && !user ? <div className={styles.shade} /> : undefined),
    [is_loading, user]
  );

  const invalid_code = useMemo(
    () =>
      !is_loading && !user ? (
        <Group className={styles.error_shade}>
          <Icon icon="close" size={64} />

          <div>{ERROR_LITERAL[error || ERRORS.CODE_IS_INVALID]}</div>

          <div className={styles.spacer} />

          <Button color="primary" onClick={onRequestClose}>
            Очень жаль
          </Button>
        </Group>
      ) : (
        undefined
      ),
    [is_loading, user, error, onRequestClose]
  );

  useCloseOnEscape(onRequestClose);

  return (
    <form onSubmit={onSubmit}>
      <BetterScrollDialog
        footer={buttons}
        width={300}
        onClose={onRequestClose}
        is_loading={is_loading}
        error={error && ERROR_LITERAL[error]}
        overlay={overlay || not_ready || invalid_code}
      >
        <div className={styles.wrap}>
          <Group>
            <div className={styles.header}>
              Пришло время сменить пароль{user && user.username && `, ~${user.username}`}
            </div>

            <InputText
              title="Новый пароль"
              value={password}
              handler={setPassword}
              autoFocus
              type="password"
            />

            <InputText
              title="Ещё раз"
              type="password"
              value={password_again}
              handler={setPasswordAgain}
              error={password_again && doesnt_match ? ERROR_LITERAL[ERRORS.DOESNT_MATCH] : ''}
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

const RestorePasswordDialog = connect(
  mapStateToProps,
  mapDispatchToProps
)(RestorePasswordDialogUnconnected);

export { RestorePasswordDialog };
