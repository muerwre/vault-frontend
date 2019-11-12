import { call, put, takeLatest, select, delay } from 'redux-saga/effects';
import { AUTH_USER_ACTIONS, EMPTY_USER, USER_ERRORS } from '~/redux/auth/constants';
import {
  authSetToken,
  userSetLoginError,
  authSetUser,
  userSendLoginRequest,
  gotAuthPostMessage,
  authOpenProfile,
  authSetProfile,
  authGetMessages,
  authSendMessage,
} from '~/redux/auth/actions';
import {
  apiUserLogin,
  apiAuthGetUser,
  apiAuthGetUserProfile,
  apiAuthGetUserMessages,
  apiAuthSendMessage,
} from '~/redux/auth/api';
import { modalSetShown, modalShowDialog } from '~/redux/modal/actions';
import { selectToken, selectAuthProfile } from './selectors';
import { IResultWithStatus } from '../types';
import { IUser } from './types';
import { REHYDRATE, RehydrateAction } from 'redux-persist';
import { selectModal } from '../modal/selectors';
import { IModalState } from '../modal/reducer';
import { DIALOGS } from '../modal/constants';
import { ERRORS } from '~/constants/errors';

export function* reqWrapper(requestAction, props = {}): ReturnType<typeof requestAction> {
  const access = yield select(selectToken);

  const result = yield call(requestAction, { access, ...props });

  if (result && result.status === 401) {
    return { error: USER_ERRORS.UNAUTHORIZED, data: {} };
  }

  return result;
}

function* sendLoginRequestSaga({ username, password }: ReturnType<typeof userSendLoginRequest>) {
  if (!username || !password) return;

  const {
    error,
    data: { token, user },
  }: IResultWithStatus<{ token: string; user: IUser }> = yield call(apiUserLogin, {
    username,
    password,
  });

  if (error) {
    yield put(userSetLoginError(error));
    return;
  }

  yield put(authSetToken(token));
  yield put(authSetUser({ ...user, is_user: true }));
  yield put(modalSetShown(false));
}

function* refreshUser() {
  const {
    error,
    data: { user },
  }: IResultWithStatus<{ user: IUser }> = yield call(reqWrapper, apiAuthGetUser);

  if (error) {
    yield put(
      authSetUser({
        ...EMPTY_USER,
        is_user: false,
      })
    );

    return;
  }

  yield put(authSetUser({ ...user, is_user: true }));
}

function* checkUserSaga({ key }: RehydrateAction) {
  if (key !== 'auth') return;
  yield call(refreshUser);
  // yield put(authOpenProfile('gvorcek'));
}

function* gotPostMessageSaga({ token }: ReturnType<typeof gotAuthPostMessage>) {
  yield put(authSetToken(token));
  yield call(refreshUser);

  const { is_shown, dialog }: IModalState = yield select(selectModal);

  if (is_shown && dialog === DIALOGS.LOGIN) yield put(modalSetShown(false));
}

function* logoutSaga() {
  yield put(authSetToken(null));
  yield put(authSetUser({ ...EMPTY_USER }));
}

function* openProfile({ username }: ReturnType<typeof authOpenProfile>) {
  yield put(modalShowDialog(DIALOGS.PROFILE));
  yield put(authSetProfile({ is_loading: true }));

  const {
    error,
    data: { user },
  } = yield call(reqWrapper, apiAuthGetUserProfile, { username });

  if (error || !user) {
    return yield put(modalSetShown(false));
  }

  yield put(authSetProfile({ is_loading: false, user, messages: [] }));
}

function* getMessages({ username }: ReturnType<typeof authGetMessages>) {
  // yield put(modalShowDialog(DIALOGS.PROFILE));
  const { messages } = yield select(selectAuthProfile);

  yield put(
    authSetProfile({
      is_loading_messages: true,
      messages:
        messages &&
        messages.length > 0 &&
        (messages[0].to.username === username || messages[0].from.username === username)
          ? messages
          : [],
    })
  );

  const {
    error,
    data,
    // data: { messages },
  } = yield call(reqWrapper, apiAuthGetUserMessages, { username });

  if (error || !data.messages) {
    return yield put(
      authSetProfile({
        is_loading_messages: false,
        messages_error: ERRORS.EMPTY_RESPONSE,
      })
    );
  }

  yield put(authSetProfile({ is_loading_messages: false, messages: data.messages }));
}

function* sendMessage({ message, onSuccess }: ReturnType<typeof authSendMessage>) {
  const {
    user: { username },
  } = yield select(selectAuthProfile);

  if (!username) return;

  yield put(authSetProfile({ is_sending_messages: true, messages_error: null }));

  const { error, data } = yield call(reqWrapper, apiAuthSendMessage, { username, message });

  console.log({ error, data });

  if (error || !data.message) {
    return yield put(
      authSetProfile({
        is_sending_messages: false,
        messages_error: error || ERRORS.EMPTY_RESPONSE,
      })
    );
  }

  const { user, messages } = yield select(selectAuthProfile);

  if (user.username !== username) {
    return yield put(authSetProfile({ is_sending_messages: false }));
  }

  yield put(
    authSetProfile({
      is_sending_messages: false,
      messages: [data.message, ...messages],
    })
  );

  onSuccess();
}

function* authSaga() {
  yield takeLatest(REHYDRATE, checkUserSaga);
  yield takeLatest(AUTH_USER_ACTIONS.LOGOUT, logoutSaga);
  yield takeLatest(AUTH_USER_ACTIONS.SEND_LOGIN_REQUEST, sendLoginRequestSaga);
  yield takeLatest(AUTH_USER_ACTIONS.GOT_AUTH_POST_MESSAGE, gotPostMessageSaga);
  yield takeLatest(AUTH_USER_ACTIONS.OPEN_PROFILE, openProfile);
  yield takeLatest(AUTH_USER_ACTIONS.GET_MESSAGES, getMessages);
  yield takeLatest(AUTH_USER_ACTIONS.SEND_MESSAGE, sendMessage);
}

export default authSaga;
