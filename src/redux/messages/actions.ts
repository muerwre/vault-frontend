import { IMessage } from '~/redux/types';
import { MESSAGES_ACTIONS } from '~/redux/messages/constants';
import { IMessagesState } from '~/redux/messages';

export const messagesGetMessages = (username: string) => ({
  type: MESSAGES_ACTIONS.GET_MESSAGES,
  username,
});

export const messagesSendMessage = (message: Partial<IMessage>, onSuccess) => ({
  type: MESSAGES_ACTIONS.SEND_MESSAGE,
  message,
  onSuccess,
});

export const messagesDeleteMessage = (id: IMessage['id']) => ({
  type: MESSAGES_ACTIONS.DELETE_MESSAGE,
  id,
});

export const messagesSetMessages = (messages: Partial<IMessagesState>) => ({
  type: MESSAGES_ACTIONS.SET_MESSAGES,
  messages,
});
