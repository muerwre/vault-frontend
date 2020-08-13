import React, { FC, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { DIALOGS, IDialogProps } from '~/redux/modal/constants';
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
import pick from 'ramda/es/pick';
import { LoginDialogButtons } from '~/containers/dialogs/LoginDialogButtons';

const mapStateToProps = state => ({
  ...pick(['error', 'is_registering'], selectAuthLogin(state)),
});

const mapDispatchToProps = {
  userSendLoginRequest: ACTIONS.userSendLoginRequest,
  userSetLoginError: ACTIONS.userSetLoginError,
  authLoginWithSocial: ACTIONS.authLoginWithSocial,
  modalShowDialog: MODAL_ACTIONS.modalShowDialog,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IDialogProps & {};

const LoginDialogUnconnected: FC<IProps> = ({
  error,

  onRequestClose,
  userSendLoginRequest,
  userSetLoginError,
  authLoginWithSocial,
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

  const onMessage = useCallback(
    (event: MessageEvent) => {
      if (!event?.data?.type) return;

      switch (event?.data?.type) {
        case 'oauth_processed':
          return authLoginWithSocial(event?.data?.payload?.token);
        case 'oauth_error':
          return userSetLoginError(event?.data?.payload?.error);
        default:
          return;
      }
    },
    [authLoginWithSocial, userSetLoginError]
  );

  useEffect(() => {
    if (error) userSetLoginError(null);
  }, [username, password]);

  useEffect(() => {
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onMessage]);

  useCloseOnEscape(onRequestClose);

  return (
    <form onSubmit={onSubmit}>
      <div>
        <BetterScrollDialog
          width={300}
          error={error}
          onClose={onRequestClose}
          footer={<LoginDialogButtons openOauthWindow={openOauthWindow} />}
        >
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
      </div>
    </form>
  );
};

const LoginDialog = connect(mapStateToProps, mapDispatchToProps)(LoginDialogUnconnected);

export { LoginDialog };
