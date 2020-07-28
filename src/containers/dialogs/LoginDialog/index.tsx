import React, { FC, FormEvent, useCallback, useEffect, useState, useMemo } from 'react';
import { connect } from 'react-redux';
import { IDialogProps } from '~/redux/modal/constants';
import { DIALOGS } from '~/redux/modal/constants';
import { useCloseOnEscape } from '~/utils/hooks';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import { Button } from '~/components/input/Button';
import { Padder } from '~/components/containers/Padder';
import { selectAuthLogin } from '~/redux/auth/selectors';
import { API } from '~/constants/api';
import { BetterScrollDialog } from '../BetterScrollDialog';

import * as styles from './styles.scss';
import * as ACTIONS from '~/redux/auth/actions';
import * as MODAL_ACTIONS from '~/redux/modal/actions';
import { ISocialProvider } from '~/redux/auth/types';
import { Grid } from '~/components/containers/Grid';

const mapStateToProps = selectAuthLogin;

const mapDispatchToProps = {
  userSendLoginRequest: ACTIONS.userSendLoginRequest,
  userSetLoginError: ACTIONS.userSetLoginError,
  modalShowDialog: MODAL_ACTIONS.modalShowDialog,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IDialogProps & {};

const LoginDialogUnconnected: FC<IProps> = ({
  onRequestClose,
  error,
  userSendLoginRequest,
  userSetLoginError,
  modalShowDialog,
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

  const onRestoreRequest = useCallback(
    event => {
      console.log('a', { MODAL_ACTIONS, modalShowDialog, userSetLoginError });
      event.preventDefault();
      modalShowDialog(DIALOGS.RESTORE_REQUEST);
    },
    [modalShowDialog, userSetLoginError]
  );

  const openOauthWindow = useCallback(
    (provider: ISocialProvider) => () => {
      window.open(API.USER.OAUTH_WINDOW(provider), '', 'width=600,height=400');
    },
    []
  );

  const onMessage = useCallback((event: MessageEvent) => {
    if (!event?.data?.type) return;

    switch (event?.data?.type) {
      case 'oauth_processed':
        // return authAttachSocial(event?.data?.payload?.token);
        return console.log('oauth_processed', event?.data?.payload?.token);
      case 'oauth_error':
        // return authSetSocials({ error: event?.data?.payload?.error || '' });
        return console.log('oauth_error', { error: event?.data?.payload?.error || '' });
      default:
        return;
    }
  }, []);

  useEffect(() => {
    if (error) userSetLoginError(null);
  }, [username, password]);

  useEffect(() => {
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onMessage]);

  const buttons = useMemo(
    () => (
      <Group className={styles.footer}>
        <Button>
          <span>Войти</span>
        </Button>

        <Grid columns="repeat(2, 1fr)">
          <Button
            color="outline"
            iconLeft="google"
            type="button"
            onClick={openOauthWindow('google')}
          >
            <span>Google</span>
          </Button>

          <Button
            color="outline"
            iconLeft="vk"
            type="button"
            onClick={openOauthWindow('vkontakte')}
          >
            <span>Вконтакте</span>
          </Button>
        </Grid>
      </Group>
    ),
    [openOauthWindow]
  );

  useCloseOnEscape(onRequestClose);

  return (
    <form onSubmit={onSubmit}>
      <BetterScrollDialog width={300} error={error} onClose={onRequestClose} footer={buttons}>
        <Padder>
          <div className={styles.wrap}>
            <Group>
              <h2>РЕШИТЕЛЬНО ВОЙТИ</h2>

              <InputText title="Логин" handler={setUserName} value={username} autoFocus />

              <InputText title="Пароль" handler={setPassword} value={password} type="password" />

              <Button
                color="link"
                type="button"
                onClick={onRestoreRequest}
                className={styles.forgot_button}
              >
                Вспомнить пароль
              </Button>
            </Group>
          </div>
        </Padder>
      </BetterScrollDialog>
    </form>
  );
};

const LoginDialog = connect(mapStateToProps, mapDispatchToProps)(LoginDialogUnconnected);

export { LoginDialog };
