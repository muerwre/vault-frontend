import React, {
  FC, FormEvent, useCallback, useEffect, useState
} from 'react';
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

const mapStateToProps = selectAuthLogin;

const mapDispatchToProps = {
  userSendLoginRequest: ACTIONS.userSendLoginRequest,
  userSetLoginError: ACTIONS.userSetLoginError,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IDialogProps & {};

const LoginDialogUnconnected: FC<IProps> = ({
  onRequestClose, error, userSendLoginRequest, userSetLoginError
}) => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();
    userSendLoginRequest({ username, password });
  }, [userSendLoginRequest, username, password]);

  useEffect(() => {
    if (error) userSetLoginError(null);
  }, [username, password]);

  const buttons = (
    <Padder>
      <Group horizontal>
        <Button title="ВОЙТИ" stretchy />
      </Group>
    </Padder>
  );

  useCloseOnEscape(onRequestClose);

  console.log({ error });

  return (
    <form onSubmit={onSubmit}>
      <ScrollDialog buttons={buttons} width={260} error={error}>
        <Padder>
          <div className={styles.wrap}>
            <Group>
              <h2>РЕШИТЕЛЬНО ВОЙТИ</h2>

              <div />
              <div />

              <InputText title="Логин" handler={setUserName} value={username} />
              <InputText title="Пароль" handler={setPassword} value={password} />
            </Group>
          </div>
        </Padder>
      </ScrollDialog>
    </form>
  );
};

const LoginDialog = connect(mapStateToProps, mapDispatchToProps)(LoginDialogUnconnected);

export { LoginDialog };
