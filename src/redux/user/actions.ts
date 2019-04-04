import { USER_ACTIONS } from "$redux/user/constants";
import { IUserProfile } from "$redux/user/reducer";

export const userSendLoginRequest = ({
  username, password
}: {
  username: string, password: string
}) => ({ type: USER_ACTIONS.SEND_LOGIN_REQUEST, username, password });

export const userSetLoginError = ({
  error
}: {
  error: string
}) => ({ type: USER_ACTIONS.SET_LOGIN_ERROR, error });

export const userSetUser = (profile: Partial<IUserProfile>) => ({ type: USER_ACTIONS.SET_USER, profile });
