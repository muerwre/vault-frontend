import {call, put, takeLatest } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import {AUTH_USER_ACTIONS} from "~/redux/auth/constants";
import * as ActionCreators from '~/redux/auth/actions';
import {authSetToken, userSetLoginError} from "~/redux/auth/actions";
import {apiUserLogin} from "~/redux/auth/api";

function* sendLoginRequestSaga({ username, password }: ReturnType<typeof ActionCreators.userSendLoginRequest>): SagaIterator {
  if (!username || !password) return;

  const { error, data: { access, refresh, user }} = yield call(apiUserLogin, { username, password });

  console.log({ access, refresh, user, error });

  if (error) return yield put(userSetLoginError(error));

  yield put(authSetToken({ access, refresh }));
  // const { token, status, user }:
  //   { token: string, status: number, user: IApiUser } = yield call(apiUserLogin, { username, password });
  //
  // if (!token) return yield put(userSetLoginError({ error: USER_STATUSES[status] || USER_ERRORS.INVALID_CREDENTIALS }));
  //
  // const { id, role, email, activated: is_activated } = user;
  //
  // yield put(userSetUser({ token, id, role, email, username: user.username, is_activated, is_user: true }));
  // yield put(push('/'));
}

function* mySaga() {
  yield takeLatest(AUTH_USER_ACTIONS.SEND_LOGIN_REQUEST, sendLoginRequestSaga);
}

export default mySaga;
