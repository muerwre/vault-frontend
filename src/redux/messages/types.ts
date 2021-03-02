import { IMessage } from '~/redux/types';

export type ApiGetUserMessagesRequest = {
  username: string;
  after?: string;
  before?: string;
};
export type ApiGetUserMessagesResponse = { messages: IMessage[] };

export type ApiSendMessageRequest = {
  username: string;
  message: Partial<IMessage>;
};
export type ApiSendMessageResult = {
  message: IMessage;
};

export type ApiDeleteMessageRequest = {
  username: string;
  id: number;
  is_locked: boolean;
};

export type ApiDeleteMessageResult = {
  message: IMessage;
};
