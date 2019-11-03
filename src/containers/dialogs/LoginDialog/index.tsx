import React, { FC, FormEvent, useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ScrollDialog } from '../ScrollDialog';
import { IDialogProps } from '~/redux/modal/constants';
import { useCloseOnEscape } from '~/utils/hooks';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import { Button } from '~/components/input/Button';
import { Padder } from '~/components/containers/Padder';
import * as styles from './styles.scss';
import { selectAuthLogin } from '~/redux/auth/selectors';
import * as ACTIONS from '~/redux/auth/actions';
import { API } from '~/constants/api';
import { BetterScrollDialog } from '../BetterScrollDialog';

const mapStateToProps = selectAuthLogin;

const mapDispatchToProps = {
  userSendLoginRequest: ACTIONS.userSendLoginRequest,
  userSetLoginError: ACTIONS.userSetLoginError,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IDialogProps & {};

const LoginDialogUnconnected: FC<IProps> = ({
  onRequestClose,
  error,
  userSendLoginRequest,
  userSetLoginError,
}) => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      userSendLoginRequest({ username, password });
    },
    [userSendLoginRequest, username, password]
  );

  const onSocialLogin = useCallback(() => {
    window.open(API.USER.VKONTAKTE_LOGIN, '', 'width=600,height=400');
  }, []);

  useEffect(() => {
    if (error) userSetLoginError(null);
  }, [username, password]);

  const buttons = (
    <Group horizontal className={styles.footer}>
      <Button stretchy>
        <span>Войти</span>
      </Button>
    </Group>
  );

  useCloseOnEscape(onRequestClose);

  return (
    <form onSubmit={onSubmit}>
      <BetterScrollDialog width={260} error={error} onClose={onRequestClose} footer={buttons}>
        <Padder>
          <div className={styles.wrap}>
            <Group>
              <h2>РЕШИТЕЛЬНО ВОЙТИ</h2>

              <InputText title="Логин" handler={setUserName} value={username} autoFocus />
              <InputText title="Пароль" handler={setPassword} value={password} />

              <Group className={styles.buttons}>
                <Button className={styles.vk} iconLeft="vk" type="button" onClick={onSocialLogin}>
                  <span>Вконтакте</span>
                </Button>
              </Group>
            </Group>
          </div>
        </Padder>
      </BetterScrollDialog>
    </form>
  );
};

const LoginDialog = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginDialogUnconnected);

export { LoginDialog };
