import { api, cleanResult } from '~/utils/api';
import { API } from '~/constants/api';
import {
  ApiDeleteMessageRequest,
  ApiDeleteMessageResult,
  ApiGetUserMessagesRequest,
  ApiGetUserMessagesResponse,
  ApiSendMessageRequest,
  ApiSendMessageResult,
} from '~/redux/messages/types';

export const apiGetUserMessages = ({ username, after, before }: ApiGetUserMessagesRequest) =>
  api
    .get<ApiGetUserMessagesResponse>(API.USER.MESSAGES(username), {
      params: { after, before },
    })
    .then(cleanResult);

export const apiSendMessage = ({ username, message }: ApiSendMessageRequest) =>
  api
    .post<ApiSendMessageResult>(API.USER.MESSAGE_SEND(username), { message })
    .then(cleanResult);

export const apiDeleteMessage = ({ username, id, is_locked }: ApiDeleteMessageRequest) =>
  api
    .delete<ApiDeleteMessageResult>(API.USER.MESSAGE_DELETE(username, id), {
      params: { is_locked },
    })
    .then(cleanResult);
