import { createReducer } from '~/utils/reducer';
import { MESSAGE_HANDLERS } from '~/redux/messages/handlers';
import { IMessage } from '~/redux/types';

export interface IMessagesState {
  is_loading_messages: boolean;
  is_sending_messages: boolean;
  messages: IMessage[];
  error: string;
}

const INITIAL_STATE: IMessagesState = {
  is_loading_messages: true,
  is_sending_messages: false,
  error: null,
  messages: [],
};

export default createReducer(INITIAL_STATE, MESSAGE_HANDLERS);
