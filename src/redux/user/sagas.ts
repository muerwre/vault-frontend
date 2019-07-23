import { call, put, takeLatest } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import { IApiUser, USER_ACTIONS, USER_ERRORS, USER_STATUSES } from "~/redux/user/constants";
import * as ActionCreators from '~/redux/user/actions';
import { apiUserLogin } from "~/redux/user/api";
import { userSetLoginError, userSetUser } from "~/redux/user/actions";
import { push } from 'connected-react-router'

function* sendLoginRequestSaga({ username, password }: ReturnType<typeof ActionCreators.userSendLoginRequest>): SagaIterator {
  if (!username || !password) return yield put(userSetLoginError({ error: USER_ERRORS.EMPTY_CREDENTIALS }));

  const { token, status, user }:
    { token: string, status: number, user: IApiUser } = yield call(apiUserLogin, { username, password });

  if (!token) return yield put(userSetLoginError({ error: USER_STATUSES[status] || USER_ERRORS.INVALID_CREDENTIALS }));

  const { id, role, email, activated: is_activated } = user;

  yield put(userSetUser({ token, id, role, email, username: user.username, is_activated, is_user: true }));
  yield put(push('/'));
}

function* mySaga() {
  yield takeLatest(USER_ACTIONS.SEND_LOGIN_REQUEST, sendLoginRequestSaga);
}

export default mySaga;
