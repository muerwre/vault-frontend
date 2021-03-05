import { authSetUpdates } from '~/redux/auth/actions';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  selectAuthProfile,
  selectAuthProfileUsername,
  selectAuthUpdates,
} from '~/redux/auth/selectors';
import { apiDeleteMessage, apiGetUserMessages, apiSendMessage } from '~/redux/messages/api';
import { ERRORS } from '~/constants/errors';
import { IMessageNotification, Unwrap } from '~/redux/types';
import {
  messagesDeleteMessage,
  messagesGetMessages,
  messagesRefreshMessages,
  messagesSendMessage,
  messagesSet,
} from '~/redux/messages/actions';
import { MESSAGES_ACTIONS } from '~/redux/messages/constants';
import { selectMessages } from '~/redux/messages/selectors';
import { sortCreatedAtDesc } from '~/utils/date';

function* getMessages({ username }: ReturnType<typeof messagesGetMessages>) {
  try {
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

    const data: Unwrap<typeof apiGetUserMessages> = yield call(apiGetUserMessages, {
      username,
    });

    yield put(messagesSet({ is_loading_messages: false, messages: data.messages }));

    const { notifications }: ReturnType<typeof selectAuthUpdates> = yield select(selectAuthUpdates);

    // clear viewed message from notifcation list
    const filtered = notifications.filter(
      notification =>
        notification.type !== 'message' ||
        (notification as IMessageNotification)?.content?.from?.username !== username
    );

    if (filtered.length !== notifications.length) {
      yield put(authSetUpdates({ notifications: filtered }));
    }
  } catch (error) {
    messagesSet({
      error: error.message || ERRORS.EMPTY_RESPONSE,
    });
  } finally {
    yield put(
      messagesSet({
        is_loading_messages: false,
      })
    );
  }
}

function* sendMessage({ message, onSuccess }: ReturnType<typeof messagesSendMessage>) {
  try {
    const username: ReturnType<typeof selectAuthProfileUsername> = yield select(
      selectAuthProfileUsername
    );

    if (!username) return;

    yield put(messagesSet({ is_sending_messages: true, error: '' }));

    const data: Unwrap<typeof apiSendMessage> = yield call(apiSendMessage, {
      username,
      message,
    });

    const { user }: ReturnType<typeof selectAuthProfile> = yield select(selectAuthProfile);

    if (user?.username !== username) {
      return yield put(messagesSet({ is_sending_messages: false }));
    }

    const { messages }: ReturnType<typeof selectMessages> = yield select(selectMessages);

    if (message.id && message.id > 0) {
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
  } catch (error) {
    messagesSet({
      error: error.message || ERRORS.EMPTY_RESPONSE,
    });
  } finally {
    yield put(
      messagesSet({
        is_loading_messages: false,
      })
    );
  }
}

function* deleteMessage({ id, is_locked }: ReturnType<typeof messagesDeleteMessage>) {
  try {
    const username: ReturnType<typeof selectAuthProfileUsername> = yield select(
      selectAuthProfileUsername
    );

    if (!username) return;

    yield put(messagesSet({ is_sending_messages: true, error: '' }));

    const data: Unwrap<typeof apiDeleteMessage> = yield call(apiDeleteMessage, {
      username,
      id,
      is_locked,
    });

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
  } catch (error) {
    messagesSet({
      error: error.message || ERRORS.EMPTY_RESPONSE,
    });
  } finally {
    yield put(
      messagesSet({
        is_loading_messages: false,
      })
    );
  }
}

function* refreshMessages({}: ReturnType<typeof messagesRefreshMessages>) {
  try {
    const username: ReturnType<typeof selectAuthProfileUsername> = yield select(
      selectAuthProfileUsername
    );

    if (!username) return;

    const { messages }: ReturnType<typeof selectMessages> = yield select(selectMessages);

    yield put(messagesSet({ is_loading_messages: true }));

    const after = messages.length > 0 ? messages[0].created_at : undefined;

    const data: Unwrap<typeof apiGetUserMessages> = yield call(apiGetUserMessages, {
      username,
      after,
    });

    yield put(messagesSet({ is_loading_messages: false }));

    if (!data.messages || !data.messages.length) return;

    const newMessages = [...data.messages, ...messages].sort(sortCreatedAtDesc);
    yield put(messagesSet({ messages: newMessages }));
  } catch (error) {
    messagesSet({
      error: error.message || ERRORS.EMPTY_RESPONSE,
    });
  } finally {
    yield put(
      messagesSet({
        is_loading_messages: false,
      })
    );
  }
}

export default function*() {
  yield takeLatest(MESSAGES_ACTIONS.GET_MESSAGES, getMessages);
  yield takeLatest(MESSAGES_ACTIONS.SEND_MESSAGE, sendMessage);
  yield takeLatest(MESSAGES_ACTIONS.DELETE_MESSAGE, deleteMessage);
  yield takeLatest(MESSAGES_ACTIONS.REFRESH_MESSAGES, refreshMessages);
}
