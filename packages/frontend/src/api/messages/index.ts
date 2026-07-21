import {
  ApiDeleteMessageRequest,
  ApiDeleteMessageResult,
  ApiGetUserMessagesRequest,
  ApiGetUserMessagesResponse,
  ApiSendMessageRequest,
  ApiSendMessageResult,
} from '~/api/messages/types';
import { API } from '~/constants/api';
import { api, unwrap } from '~/utils/api';

export const apiGetUserMessages = ({
  username,
  after,
  before,
}: ApiGetUserMessagesRequest) =>
  api
    .get<ApiGetUserMessagesResponse>(API.USER.MESSAGES(username), {
      params: { after, before },
    })
    .then(unwrap);

export const apiSendMessage = ({ username, message }: ApiSendMessageRequest) =>
  api
    .post<ApiSendMessageResult>(API.USER.MESSAGE_SEND(username), { message })
    .then(unwrap);

export const apiDeleteMessage = ({
  username,
  id,
  is_locked,
}: ApiDeleteMessageRequest) =>
  api
    .delete<ApiDeleteMessageResult>(API.USER.MESSAGE_DELETE(username, id), {
      params: { is_locked },
    })
    .then(unwrap);
