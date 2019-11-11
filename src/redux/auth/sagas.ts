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
} from '~/redux/auth/actions';
import { apiUserLogin, apiAuthGetUser, apiAuthGetUserProfile } from '~/redux/auth/api';
import { modalSetShown, modalShowDialog } from '~/redux/modal/actions';
import { selectToken } from './selectors';
import { IResultWithStatus } from '../types';
import { IUser } from './types';
import { REHYDRATE, RehydrateAction } from 'redux-persist';
import { selectModal } from '../modal/selectors';
import { IModalState } from '../modal/reducer';
import { DIALOGS } from '../modal/constants';

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

  yield put(authSetProfile({ is_loading: false, user }));
}

function* authSaga() {
  yield takeLatest(REHYDRATE, checkUserSaga);
  yield takeLatest(AUTH_USER_ACTIONS.LOGOUT, logoutSaga);
  yield takeLatest(AUTH_USER_ACTIONS.SEND_LOGIN_REQUEST, sendLoginRequestSaga);
  yield takeLatest(AUTH_USER_ACTIONS.GOT_AUTH_POST_MESSAGE, gotPostMessageSaga);
  yield takeLatest(AUTH_USER_ACTIONS.OPEN_PROFILE, openProfile);
}

export default authSaga;
