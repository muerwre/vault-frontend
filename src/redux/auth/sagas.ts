import {call, put, takeLatest } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import {AUTH_USER_ACTIONS} from "~/redux/auth/constants";
import * as ActionCreators from '~/redux/auth/actions';
import {authSetToken, userSetLoginError} from "~/redux/auth/actions";
import {apiUserLogin, getAuthSelf} from "~/redux/auth/api";
import {modalSetShown} from "~/redux/modal/actions";

function* sendLoginRequestSaga({ username, password }: ReturnType<typeof ActionCreators.userSendLoginRequest>): SagaIterator {
  if (!username || !password) return;

  const { error, data: { access, refresh }} = yield call(apiUserLogin, { username, password });

  console.log({ access, refresh, error });

  if (error) return yield put(userSetLoginError(error));

  yield put(authSetToken({ access, refresh }));

  const info = yield call(getAuthSelf); // todo: reqWrapper here

  // todo: get /auth/me

  yield put(modalSetShown(false));
}

function* mySaga() {
  yield takeLatest(AUTH_USER_ACTIONS.SEND_LOGIN_REQUEST, sendLoginRequestSaga);
}

export default mySaga;
