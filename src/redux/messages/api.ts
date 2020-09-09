import { IMessage, IResultWithStatus } from '~/redux/types';
import { api, configWithToken, errorMiddleware, resultMiddleware } from '~/utils/api';
import { API } from '~/constants/api';

export const apiMessagesGetUserMessages = ({
  access,
  username,
  after,
  before,
}: {
  access: string;
  username: string;
  after?: string;
  before?: string;
}): Promise<IResultWithStatus<{ messages: IMessage[] }>> =>
  api
    .get(API.USER.MESSAGES(username), configWithToken(access, { params: { after, before } }))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const apiMessagesSendMessage = ({
  access,
  username,
  message,
}): Promise<IResultWithStatus<{ message: IMessage }>> =>
  api
    .post(API.USER.MESSAGE_SEND(username), { message }, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const apiMessagesDeleteMessage = ({
  access,
  username,
  id,
  is_locked,
}: {
  access: string;
  username: string;
  id: number;
  is_locked: boolean;
}): Promise<IResultWithStatus<{ message: IMessage }>> =>
  api
    .delete(
      API.USER.MESSAGE_DELETE(username, id),
      configWithToken(access, { params: { is_locked } })
    )
    .then(resultMiddleware)
    .catch(errorMiddleware);
