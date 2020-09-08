import { MESSAGES_ACTIONS } from '~/redux/messages/constants';
import { IMessagesState } from '~/redux/messages';
import { messagesSet } from '~/redux/messages/actions';

const setMessages = (
  state: IMessagesState,
  { messages }: ReturnType<typeof messagesSet>
): IMessagesState => ({
  ...state,
  ...messages,
});

export const MESSAGE_HANDLERS = {
  [MESSAGES_ACTIONS.SET_MESSAGES]: setMessages,
};
