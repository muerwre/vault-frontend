import { authSetUpdates } from '~/redux/auth/actions';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { selectAuthProfile, selectAuthUpdates } from '~/redux/auth/selectors';
import { apiAuthGetUserMessages, apiAuthSendMessage } from '~/redux/auth/api';
import { ERRORS } from '~/constants/errors';
import { IMessageNotification } from '~/redux/types';
import { reqWrapper } from '~/redux/auth/sagas';
import { messagesGetMessages, messagesSendMessage, messagesSet } from '~/redux/messages/actions';
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

  const { error, data } = yield call(reqWrapper, apiAuthGetUserMessages, { username });

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
  const {
    user: { username },
  }: ReturnType<typeof selectAuthProfile> = yield select(selectAuthProfile);

  if (!username) return;

  yield put(messagesSet({ is_sending_messages: true, messages_error: null }));

  const { error, data } = yield call(reqWrapper, apiAuthSendMessage, {
    username,
    message,
  });

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

  yield put(
    messagesSet({
      is_sending_messages: false,
      messages: [data.message, ...messages],
    })
  );

  onSuccess();
}

export default function*() {
  yield takeLatest(MESSAGES_ACTIONS.GET_MESSAGES, getMessages);
  yield takeLatest(MESSAGES_ACTIONS.SEND_MESSAGE, sendMessage);
}
