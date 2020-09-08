import { authSetUpdates } from '~/redux/auth/actions';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  selectAuthProfile,
  selectAuthProfileUsername,
  selectAuthUpdates,
} from '~/redux/auth/selectors';
import {
  apiMessagesDeleteMessage,
  apiMessagesGetUserMessages,
  apiMessagesSendMessage,
} from '~/redux/messages/api';
import { ERRORS } from '~/constants/errors';
import { IMessageNotification, Unwrap } from '~/redux/types';
import { reqWrapper } from '~/redux/auth/sagas';
import {
  messagesDeleteMessage,
  messagesGetMessages,
  messagesSendMessage,
  messagesSet,
} from '~/redux/messages/actions';
import { MESSAGES_ACTIONS } from '~/redux/messages/constants';
import { selectMessages } from '~/redux/messages/selectors';

function* getMessages({ username }: ReturnType<typeof messagesGetMessages>) {
  const { messages }: ReturnType<typeof selectMessages> = yield select(selectMessages);

  yield put(
    messagesSet({
      is_loading_messages: true,
      messages:
        messages &&
        messages.length > 0 &&
        (messages[0].to.username === username || messages[0].from.username === username)
          ? messages
          : [],
    })
  );

  const { error, data } = yield call(reqWrapper, apiMessagesGetUserMessages, { username });

  if (error || !data.messages) {
    return yield put(
      messagesSet({
        is_loading_messages: false,
        messages_error: ERRORS.EMPTY_RESPONSE,
      })
    );
  }

  yield put(messagesSet({ is_loading_messages: false, messages: data.messages }));

  const { notifications } = yield select(selectAuthUpdates);

  // clear viewed message from notifcation list
  const filtered = notifications.filter(
    notification =>
      notification.type !== 'message' ||
      (notification as IMessageNotification).content.from.username !== username
  );

  if (filtered.length !== notifications.length) {
    yield put(authSetUpdates({ notifications: filtered }));
  }
}

function* sendMessage({ message, onSuccess }: ReturnType<typeof messagesSendMessage>) {
  const username: ReturnType<typeof selectAuthProfileUsername> = yield select(
    selectAuthProfileUsername
  );

  if (!username) return;

  yield put(messagesSet({ is_sending_messages: true, messages_error: null }));

  const { error, data }: Unwrap<ReturnType<typeof apiMessagesSendMessage>> = yield call(
    reqWrapper,
    apiMessagesSendMessage,
    {
      username,
      message,
    }
  );

  if (error || !data.message) {
    return yield put(
      messagesSet({
        is_sending_messages: false,
        messages_error: error || ERRORS.EMPTY_RESPONSE,
      })
    );
  }

  const { user }: ReturnType<typeof selectAuthProfile> = yield select(selectAuthProfile);

  if (user.username !== username) {
    return yield put(messagesSet({ is_sending_messages: false }));
  }

  const { messages }: ReturnType<typeof selectMessages> = yield select(selectMessages);

  if (message.id > 0) {
    // modified
    yield put(
      messagesSet({
        is_sending_messages: false,
        messages: messages.map(item => (item.id === message.id ? data.message : item)),
      })
    );
  } else {
    // created
    yield put(
      messagesSet({
        is_sending_messages: false,
        messages: [data.message, ...messages],
      })
    );
  }

  onSuccess();
}

function* deleteMessage({ id }: ReturnType<typeof messagesDeleteMessage>) {
  const username: ReturnType<typeof selectAuthProfileUsername> = yield select(
    selectAuthProfileUsername
  );

  if (!username) return;

  yield put(messagesSet({ is_sending_messages: true, messages_error: null }));

  const { error, data }: Unwrap<ReturnType<typeof apiMessagesDeleteMessage>> = yield call(
    reqWrapper,
    apiMessagesDeleteMessage,
    {
      username,
      id,
    }
  );

  if (error || !data.message) {
    return yield put(
      messagesSet({
        is_sending_messages: false,
      })
    );
  }

  const currentUsername: ReturnType<typeof selectAuthProfileUsername> = yield select(
    selectAuthProfileUsername
  );

  if (currentUsername !== username) {
    return yield put(messagesSet({ is_sending_messages: false }));
  }

  const { messages }: ReturnType<typeof selectMessages> = yield select(selectMessages);

  yield put(
    messagesSet({
      is_sending_messages: false,
      messages: messages.map(item => (item.id === id ? data.message : item)),
    })
  );
}

export default function*() {
  yield takeLatest(MESSAGES_ACTIONS.GET_MESSAGES, getMessages);
  yield takeLatest(MESSAGES_ACTIONS.SEND_MESSAGE, sendMessage);
  yield takeLatest(MESSAGES_ACTIONS.DELETE_MESSAGE, deleteMessage);
}
