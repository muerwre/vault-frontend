import { call, put, takeLatest, select } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import { AUTH_USER_ACTIONS } from '~/redux/auth/constants';
import {
  authSetToken,
  userSetLoginError,
  authSetUser,
  userSendLoginRequest,
} from '~/redux/auth/actions';
import { apiUserLogin, apiAuthGetUser } from '~/redux/auth/api';
import { modalSetShown, modalShowDialog } from '~/redux/modal/actions';
import { selectToken } from './selectors';
import { URLS } from '~/constants/urls';
import { DIALOGS } from '../modal/constants';
import { IResultWithStatus } from '../types';
import { IUser } from './types';
import { REHYDRATE, RehydrateAction } from 'redux-persist';

export function* reqWrapper(requestAction, props = {}): ReturnType<typeof requestAction> {
  const access = yield select(selectToken);

  const result = yield call(requestAction, { access, ...props });

  if (result && result.status === 401) {
    yield put(push(URLS.BASE));
    yield put(modalShowDialog(DIALOGS.LOGIN));

    return result;
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

function* checkUserSaga({ key }: RehydrateAction) {
  if (key !== 'auth') return;

  const {
    data: { user },
  }: IResultWithStatus<{ user: IUser }> = yield call(reqWrapper, apiAuthGetUser);

  yield put(authSetUser({ ...user, is_user: true }));
}

function* mySaga() {
  yield takeLatest(REHYDRATE, checkUserSaga);
  yield takeLatest(AUTH_USER_ACTIONS.SEND_LOGIN_REQUEST, sendLoginRequestSaga);
}

export default mySaga;
