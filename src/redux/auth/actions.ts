import { AUTH_USER_ACTIONS } from '~/redux/auth/constants';
import { IAuthState, IUser } from '~/redux/auth/types';
import { IMessage } from '../types';

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

export const gotAuthPostMessage = ({ token }: { token: string }) => ({
  type: AUTH_USER_ACTIONS.GOT_AUTH_POST_MESSAGE,
  token,
});

export const authSetUser = (profile: Partial<IUser>) => ({
  type: AUTH_USER_ACTIONS.SET_USER,
  profile,
});

export const authLogout = () => ({
  type: AUTH_USER_ACTIONS.LOGOUT,
});

export const authLoggedIn = () => ({
  type: AUTH_USER_ACTIONS.LOGGED_IN,
});

export const authOpenProfile = (username: string, tab?: IAuthState['profile']['tab']) => ({
  type: AUTH_USER_ACTIONS.OPEN_PROFILE,
  username,
  tab,
});

export const authLoadProfile = (username: string) => ({
  type: AUTH_USER_ACTIONS.LOAD_PROFILE,
  username,
});

export const authSetProfile = (profile: Partial<IAuthState['profile']>) => ({
  type: AUTH_USER_ACTIONS.SET_PROFILE,
  profile,
});

export const authGetMessages = (username: string) => ({
  type: AUTH_USER_ACTIONS.GET_MESSAGES,
  username,
});

export const authSendMessage = (message: Partial<IMessage>, onSuccess) => ({
  type: AUTH_USER_ACTIONS.SEND_MESSAGE,
  message,
  onSuccess,
});

export const authSetUpdates = (updates: Partial<IAuthState['updates']>) => ({
  type: AUTH_USER_ACTIONS.SET_UPDATES,
  updates,
});

export const authSetLastSeenMessages = (
  last_seen_messages: IAuthState['user']['last_seen_messages']
) => ({
  type: AUTH_USER_ACTIONS.SET_LAST_SEEN_MESSAGES,
  last_seen_messages,
});

export const authPatchUser = (user: Partial<IUser>) => ({
  type: AUTH_USER_ACTIONS.PATCH_USER,
  user,
});

export const authRequestRestoreCode = (field: string) => ({
  type: AUTH_USER_ACTIONS.REQUEST_RESTORE_CODE,
  field,
});

export const authSetRestore = (restore: Partial<IAuthState['restore']>) => ({
  type: AUTH_USER_ACTIONS.SET_RESTORE,
  restore,
});

export const authShowRestoreModal = (code: string) => ({
  type: AUTH_USER_ACTIONS.SHOW_RESTORE_MODAL,
  code,
});

export const authRestorePassword = (password: string) => ({
  type: AUTH_USER_ACTIONS.RESTORE_PASSWORD,
  password,
});
