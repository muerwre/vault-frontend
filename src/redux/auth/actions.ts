import { AUTH_USER_ACTIONS } from '~/redux/auth/constants';
import { IAuthState, IUser } from '~/redux/auth/types';

export const userSendLoginRequest = ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => ({ type: AUTH_USER_ACTIONS.SEND_LOGIN_REQUEST, username, password });

export const userSetLoginError = (error: IAuthState['login']['error']) => ({
  type: AUTH_USER_ACTIONS.SET_LOGIN_ERROR,
  error,
});

export const authSetToken = (token: IAuthState['token']) => ({
  type: AUTH_USER_ACTIONS.SET_TOKEN,
  token,
});

export const gotPostMessage = ({ token }: { token: string }) => ({
  type: AUTH_USER_ACTIONS.GOT_POST_MESSAGE,
  token,
});

export const authSetUser = (profile: Partial<IUser>) => ({
  type: AUTH_USER_ACTIONS.SET_USER,
  profile,
});
