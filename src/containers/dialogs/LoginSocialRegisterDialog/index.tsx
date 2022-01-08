import React, { FC, FormEvent, useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { BetterScrollDialog } from '~/containers/dialogs/BetterScrollDialog';
import { Padder } from '~/components/containers/Padder';
import { DialogTitle } from '~/components/dialogs/DialogTitle';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import styles from './styles.module.scss';
import { selectAuthRegisterSocial } from '~/redux/auth/selectors';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { useCloseOnEscape } from '~/hooks';
import { LoginSocialRegisterButtons } from '~/containers/dialogs/LoginSocialRegisterButtons';
import { Toggle } from '~/components/input/Toggle';
import { DialogComponentProps } from '~/types/modal';

const mapStateToProps = selectAuthRegisterSocial;
const mapDispatchToProps = {
  authSetRegisterSocialErrors: AUTH_ACTIONS.authSetRegisterSocialErrors,
  authSetRegisterSocial: AUTH_ACTIONS.authSetRegisterSocial,
  authSendRegisterSocial: AUTH_ACTIONS.authSendRegisterSocial,
};

type Props = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps &
  DialogComponentProps & {};

const phrase = [
  'Сушёный кабачок особенно хорош в это время года, знаете ли.',
  'Бывало, стреляешь по кабачку, или он стреляет в тебя.',
  'Он всегда рядом, кабачок -- первый сорт! Надежда империи.',
];

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
  const [isDryingPants, setIsDryingPants] = useState(false);

  const onSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      authSendRegisterSocial(username, password);
    },
    [username, password, authSendRegisterSocial]
  );

  useEffect(() => {
    if (errors.username) authSetRegisterSocialErrors({ username: '' });
  }, [authSetRegisterSocialErrors, errors.username, username]);

  useEffect(() => {
    if (errors.password) authSetRegisterSocialErrors({ password: '' });
  }, [authSetRegisterSocialErrors, errors.password, password]);

  useEffect(() => {
    if (error) authSetRegisterSocial({ error: '' });
  }, [username, password, error, authSetRegisterSocial]);

  useCloseOnEscape(onRequestClose);

  return (
    <form onSubmit={onSubmit} autoComplete="new-password">
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
                autoComplete="new-password"
              />

              <InputText
                handler={setPassword}
                value={password}
                title="Пароль"
                type="password"
                error={errors.password}
                autoComplete="new-password"
              />

              <div className={styles.check} onClick={() => setIsDryingPants(!isDryingPants)}>
                <Toggle value={isDryingPants} color="primary" />
                <span>Это не мои штаны сушатся на радиаторе в третьей лаборатории</span>
              </div>

              <div className={styles.check} onClick={() => setIsDryingPants(!isDryingPants)}>
                <Toggle value={!isDryingPants} color="primary" />
                <span>{phrase[Math.floor(Math.random() * phrase.length)]}</span>
              </div>
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
