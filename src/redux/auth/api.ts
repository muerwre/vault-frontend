import { api, configWithToken, errorMiddleware, resultMiddleware } from '~/utils/api';
import { API } from '~/constants/api';
import { IMessage, INotification, IResultWithStatus } from '~/redux/types';
import { userLoginTransform } from '~/redux/auth/transforms';
import { ISocialAccount, IUser } from './types';

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
  last,
}): Promise<IResultWithStatus<{
  notifications: INotification[];
  boris: { commented_at: string };
}>> =>
  api
    .get(API.USER.GET_UPDATES, configWithToken(access, { params: { exclude_dialogs, last } }))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const apiUpdateUser = ({ access, user }): Promise<IResultWithStatus<{ user: IUser }>> =>
  api
    .patch(API.USER.ME, { user }, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const apiRequestRestoreCode = ({ field }): Promise<IResultWithStatus<{}>> =>
  api
    .post(API.USER.REQUEST_CODE(), { field })
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const apiCheckRestoreCode = ({ code }): Promise<IResultWithStatus<{}>> =>
  api
    .get(API.USER.REQUEST_CODE(code))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const apiRestoreCode = ({ code, password }): Promise<IResultWithStatus<{}>> =>
  api
    .post(API.USER.REQUEST_CODE(code), { password })
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const apiGetSocials = ({
  access,
}: {
  access: string;
}): Promise<IResultWithStatus<{
  accounts: ISocialAccount[];
}>> =>
  api
    .get(API.USER.GET_SOCIALS, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const apiDropSocial = ({
  access,
  id,
  provider,
}: {
  access: string;
  id: string;
  provider: string;
}): Promise<IResultWithStatus<{
  accounts: ISocialAccount[];
}>> =>
  api
    .delete(API.USER.DROP_SOCIAL(provider, id), configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const apiAttachSocial = ({
  access,
  token,
}: {
  access: string;
  token: string;
}): Promise<IResultWithStatus<{
  account: ISocialAccount;
}>> =>
  api
    .post(API.USER.ATTACH_SOCIAL, { token }, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);
