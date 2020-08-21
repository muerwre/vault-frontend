import React, { FC, FormEvent, useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IDialogProps } from '~/redux/modal/constants';
import { BetterScrollDialog } from '~/containers/dialogs/BetterScrollDialog';
import { Padder } from '~/components/containers/Padder';
import { DialogTitle } from '~/components/dialogs/DialogTitle';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import styles from './styles.scss';
import { selectAuthRegisterSocial } from '~/redux/auth/selectors';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { useCloseOnEscape } from '~/utils/hooks';
import { LoginSocialRegisterButtons } from '~/containers/dialogs/LoginSocialRegisterButtons';

const mapStateToProps = selectAuthRegisterSocial;
const mapDispatchToProps = {
  authSetRegisterSocialErrors: AUTH_ACTIONS.authSetRegisterSocialErrors,
  authSetRegisterSocial: AUTH_ACTIONS.authSetRegisterSocial,
  authSendRegisterSocial: AUTH_ACTIONS.authSendRegisterSocial,
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IDialogProps & {};

const LoginSocialRegisterDialogUnconnected: FC<Props> = ({
  onRequestClose,
  errors,
  error,

  authSetRegisterSocialErrors,
  authSetRegisterSocial,
  authSendRegisterSocial,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      authSendRegisterSocial(username, password);
    },
    [username, password, authSendRegisterSocial]
  );

  useEffect(() => {
    if (errors.username) authSetRegisterSocialErrors({ username: '' });
  }, [username]);

  useEffect(() => {
    if (errors.password) authSetRegisterSocialErrors({ password: '' });
  }, [password]);

  useEffect(() => {
    if (error) authSetRegisterSocial({ error: '' });
  }, [username, password]);

  useCloseOnEscape(onRequestClose);

  return (
    <form onSubmit={onSubmit}>
      <BetterScrollDialog
        onClose={onRequestClose}
        width={300}
        error={error}
        footer={<LoginSocialRegisterButtons />}
      >
        <Padder>
          <div className={styles.wrap}>
            <Group>
              <DialogTitle>Добро пожаловать в семью!</DialogTitle>

              <InputText
                handler={setUsername}
                value={username}
                title="Юзернэйм"
                error={errors.username}
              />

              <InputText
                handler={setPassword}
                value={password}
                title="Пароль"
                type="password"
                error={errors.password}
              />

              <label className={styles.check}>
                <input type="checkbox" />
                <span>Это не мои штаны сушатся на радиаторе в третьей лаборатории</span>
              </label>
            </Group>
          </div>
        </Padder>
      </BetterScrollDialog>
    </form>
  );
};

const LoginSocialRegisterDialog = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginSocialRegisterDialogUnconnected);

export { LoginSocialRegisterDialog };
