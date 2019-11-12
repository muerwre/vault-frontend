import { api, errorMiddleware, resultMiddleware, configWithToken } from '~/utils/api';
import { API } from '~/constants/api';
import { IResultWithStatus, IMessage } from '~/redux/types';
import { userLoginTransform } from '~/redux/auth/transforms';
import { IUser } from './types';

export const apiUserLogin = ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<IResultWithStatus<{ token: string; status?: number }>> =>
  api
    .post(API.USER.LOGIN, { username, password })
    .then(resultMiddleware)
    .catch(errorMiddleware)
    .then(userLoginTransform);

export const apiAuthGetUser = ({ access }): Promise<IResultWithStatus<{ user: IUser }>> =>
  api
    .get(API.USER.ME, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const apiAuthGetUserProfile = ({
  access,
  username,
}): Promise<IResultWithStatus<{ user: IUser }>> =>
  api
    .get(API.USER.PROFILE(username), configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const apiAuthGetUserMessages = ({
  access,
  username,
}): Promise<IResultWithStatus<{ messages: IMessage[] }>> =>
  api
    .get(API.USER.MESSAGES(username), configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const apiAuthSendMessage = ({
  access,
  username,
  message,
}): Promise<IResultWithStatus<{ message: IMessage }>> =>
  api
    .post(API.USER.MESSAGE_SEND(username), { message }, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const apiAuthGetUpdates = ({
  access,
  exclude_dialogs,
}): Promise<IResultWithStatus<{ message: IMessage }>> =>
  api
    .get(API.USER.GET_UPDATES, configWithToken(access, { params: { exclude_dialogs } }))
    .then(resultMiddleware)
    .catch(errorMiddleware);
