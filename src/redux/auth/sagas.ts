import {
  call, put, takeLatest, select
} from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import { push } from 'connected-react-router';
import { AUTH_USER_ACTIONS } from '~/redux/auth/constants';
import * as ActionCreators from '~/redux/auth/actions';
import { authSetToken, userSetLoginError, authSetUser } from '~/redux/auth/actions';
import { apiUserLogin } from '~/redux/auth/api';
import { modalSetShown, modalShowDialog } from '~/redux/modal/actions';
import { selectToken } from './selectors';
import { URLS } from '~/constants/urls';
import { DIALOGS } from '../modal/constants';
import { IResultWithStatus } from '../types';
import { IToken, IUser } from './types';

export function* reqWrapper(requestAction, props = {}): ReturnType<typeof requestAction> {
  const { access } = yield select(selectToken);

  const result = yield call(requestAction, { access, ...props });

  if (result && result.status === 401) {
    yield put(push(URLS.BASE));
    yield put(modalShowDialog(DIALOGS.LOGIN));

    return result;
  }

  return result;
}

function* sendLoginRequestSaga({ username, password }: ReturnType<typeof ActionCreators.userSendLoginRequest>): SagaIterator {
  if (!username || !password) return;

  const { error, data: { token, user } }: IResultWithStatus<{ token: string; user: IUser }> = yield call(apiUserLogin, { username, password });

  console.log({ token, error });

  if (error) return yield put(userSetLoginError(error));

  yield put(authSetToken(token));
  yield put(authSetUser(user));
  yield put(modalSetShown(false));
}

function* mySaga() {
  yield takeLatest(AUTH_USER_ACTIONS.SEND_LOGIN_REQUEST, sendLoginRequestSaga);
}

export default mySaga;
