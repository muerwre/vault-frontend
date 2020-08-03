import { call, delay, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { AUTH_USER_ACTIONS, EMPTY_USER, USER_ERRORS, USER_ROLES } from '~/redux/auth/constants';
import {
  authAttachSocial,
  authDropSocial,
  authGetMessages,
  authLoadProfile,
  authLoggedIn,
  authLoginWithSocial,
  authOpenProfile,
  authPatchUser,
  authRequestRestoreCode,
  authRestorePassword,
  authSendMessage,
  authSetLastSeenMessages,
  authSetProfile,
  authSetRestore,
  authSetSocials,
  authSetToken,
  authSetUpdates,
  authSetUser,
  authShowRestoreModal,
  gotAuthPostMessage,
  userSendLoginRequest,
  userSetLoginError,
} from '~/redux/auth/actions';
import {
  apiAttachSocial,
  apiAuthGetUpdates,
  apiAuthGetUser,
  apiAuthGetUserMessages,
  apiAuthGetUserProfile,
  apiAuthSendMessage,
  apiCheckRestoreCode,
  apiDropSocial,
  apiGetSocials,
  apiLoginWithSocial,
  apiRequestRestoreCode,
  apiRestoreCode,
  apiUpdateUser,
  apiUserLogin,
} from '~/redux/auth/api';
import { modalSetShown, modalShowDialog } from '~/redux/modal/actions';
import {
  selectAuth,
  selectAuthProfile,
  selectAuthRestore,
  selectAuthUpdates,
  selectAuthUser,
  selectToken,
} from './selectors';
import { IMessageNotification, IResultWithStatus, Unwrap } from '../types';
import { IAuthState, IUser } from './types';
import { REHYDRATE, RehydrateAction } from 'redux-persist';
import { selectModal } from '~/redux/modal/selectors';
import { IModalState } from '~/redux/modal/reducer';
import { DIALOGS } from '~/redux/modal/constants';
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
  yield put(authLoggedIn());
  yield put(modalSetShown(false));
}

function* refreshUser() {
  const { token }: ReturnType<typeof selectAuth> = yield select(selectAuth);

  if (!token) return;

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
  yield put(
    authSetUpdates({
      last: null,
      notifications: [],
    })
  );
}

function* loadProfile({ username }: ReturnType<typeof authLoadProfile>) {
  yield put(authSetProfile({ is_loading: true }));

  const {
    error,
    data: { user },
  } = yield call(reqWrapper, apiAuthGetUserProfile, { username });

  if (error || !user) {
    return false;
  }

  yield put(authSetProfile({ is_loading: false, user, messages: [] }));
  return true;
}

function* openProfile({ username, tab = 'profile' }: ReturnType<typeof authOpenProfile>) {
  yield put(modalShowDialog(DIALOGS.PROFILE));
  yield put(authSetProfile({ tab }));

  const success: boolean = yield call(loadProfile, authLoadProfile(username));

  if (!success) {
    return yield put(modalSetShown(false));
  }
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

function* sendMessage({ message, onSuccess }: ReturnType<typeof authSendMessage>) {
  const {
    user: { username },
  } = yield select(selectAuthProfile);

  if (!username) return;

  yield put(authSetProfile({ is_sending_messages: true, messages_error: null }));

  const { error, data } = yield call(reqWrapper, apiAuthSendMessage, {
    username,
    message,
  });

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

function* getUpdates() {
  const user: ReturnType<typeof selectAuthUser> = yield select(selectAuthUser);

  if (!user || !user.is_user || user.role === USER_ROLES.GUEST || !user.id) return;

  const modal: IModalState = yield select(selectModal);
  const profile: IAuthState['profile'] = yield select(selectAuthProfile);
  const { last, boris_commented_at }: IAuthState['updates'] = yield select(selectAuthUpdates);
  const exclude_dialogs =
    modal.is_shown && modal.dialog === DIALOGS.PROFILE && profile.user.id ? profile.user.id : null;

  const { error, data }: Unwrap<ReturnType<typeof apiAuthGetUpdates>> = yield call(
    reqWrapper,
    apiAuthGetUpdates,
    { exclude_dialogs, last: last || user.last_seen_messages }
  );

  if (error || !data) {
    return;
  }

  if (data.notifications && data.notifications.length) {
    yield put(
      authSetUpdates({
        last: data.notifications[0].created_at,
        notifications: data.notifications,
      })
    );
  }

  if (data.boris && data.boris.commented_at && boris_commented_at !== data.boris.commented_at) {
    yield put(
      authSetUpdates({
        boris_commented_at: data.boris.commented_at,
      })
    );
  }
}

function* startPollingSaga() {
  while (true) {
    yield call(getUpdates);
    yield delay(60000);
  }
}

function* setLastSeenMessages({ last_seen_messages }: ReturnType<typeof authSetLastSeenMessages>) {
  if (!Date.parse(last_seen_messages)) return;

  yield call(reqWrapper, apiUpdateUser, { user: { last_seen_messages } });
}

function* patchUser({ user }: ReturnType<typeof authPatchUser>) {
  const me = yield select(selectAuthUser);

  const { error, data } = yield call(reqWrapper, apiUpdateUser, { user });

  if (error || !data.user || data.errors) {
    return yield put(authSetProfile({ patch_errors: data.errors }));
  }

  yield put(authSetUser({ ...me, ...data.user }));
  yield put(authSetProfile({ user: { ...me, ...data.user }, tab: 'profile' }));
}

function* requestRestoreCode({ field }: ReturnType<typeof authRequestRestoreCode>) {
  if (!field) return;

  yield put(authSetRestore({ error: null, is_loading: true }));
  const { error, data } = yield call(apiRequestRestoreCode, { field });

  if (data.error || error) {
    return yield put(authSetRestore({ is_loading: false, error: data.error || error }));
  }

  yield put(authSetRestore({ is_loading: false, is_succesfull: true }));
}

function* showRestoreModal({ code }: ReturnType<typeof authShowRestoreModal>) {
  if (!code && !code.length) {
    return yield put(authSetRestore({ error: ERRORS.CODE_IS_INVALID, is_loading: false }));
  }

  yield put(authSetRestore({ user: null, is_loading: true }));

  const { error, data } = yield call(apiCheckRestoreCode, { code });

  if (data.error || error || !data.user) {
    yield put(
      authSetRestore({ is_loading: false, error: data.error || error || ERRORS.CODE_IS_INVALID })
    );

    return yield put(modalShowDialog(DIALOGS.RESTORE_PASSWORD));
  }

  yield put(authSetRestore({ user: data.user, code, is_loading: false }));
  yield put(modalShowDialog(DIALOGS.RESTORE_PASSWORD));
}

function* restorePassword({ password }: ReturnType<typeof authRestorePassword>) {
  if (!password) return;

  yield put(authSetRestore({ is_loading: true }));
  const { code } = yield select(selectAuthRestore);

  if (!code) {
    return yield put(authSetRestore({ error: ERRORS.CODE_IS_INVALID, is_loading: false }));
  }

  const { error, data } = yield call(apiRestoreCode, { code, password });

  if (data.error || error || !data.user || !data.token) {
    return yield put(
      authSetRestore({ is_loading: false, error: data.error || error || ERRORS.CODE_IS_INVALID })
    );
  }

  yield put(authSetToken(data.token));
  yield put(authSetUser(data.user));

  yield put(authSetRestore({ is_loading: false, is_succesfull: true, error: null }));

  yield call(refreshUser);
}

function* getSocials() {
  yield put(authSetSocials({ is_loading: true, error: '' }));

  try {
    const { data, error }: Unwrap<ReturnType<typeof apiGetSocials>> = yield call(
      reqWrapper,
      apiGetSocials,
      {}
    );

    if (error) {
      throw new Error(error);
    }

    yield put(authSetSocials({ is_loading: false, accounts: data.accounts, error: '' }));
  } catch (e) {
    yield put(authSetSocials({ is_loading: false, error: e.toString() }));
  }
}

function* dropSocial({ provider, id }: ReturnType<typeof authDropSocial>) {
  try {
    yield put(authSetSocials({ error: '' }));
    const { error }: Unwrap<ReturnType<typeof apiDropSocial>> = yield call(
      reqWrapper,
      apiDropSocial,
      { id, provider }
    );

    if (error) {
      throw new Error(error);
    }

    yield call(getSocials);
  } catch (e) {
    yield put(authSetSocials({ error: e.message }));
  }
}

function* attachSocial({ token }: ReturnType<typeof authAttachSocial>) {
  if (!token) return;

  try {
    yield put(authSetSocials({ error: '', is_loading: true }));

    const { data, error }: Unwrap<ReturnType<typeof apiAttachSocial>> = yield call(
      reqWrapper,
      apiAttachSocial,
      { token }
    );

    if (error) {
      throw new Error(error);
    }

    const {
      socials: { accounts },
    }: ReturnType<typeof selectAuthProfile> = yield select(selectAuthProfile);

    if (accounts.some(it => it.id === data.account.id && it.provider === data.account.provider)) {
      yield put(authSetSocials({ is_loading: false }));
    } else {
      yield put(authSetSocials({ is_loading: false, accounts: [...accounts, data.account] }));
    }
  } catch (e) {
    yield put(authSetSocials({ is_loading: false, error: e.message }));
  }
}

function* loginWithSocial({ token }: ReturnType<typeof authLoginWithSocial>) {
  try {
    yield put(userSetLoginError(''));

    const {
      data,
      error,
    }: Unwrap<ReturnType<typeof apiLoginWithSocial>> = yield call(apiLoginWithSocial, { token });

    if (error) {
      throw new Error(error);
    }

    if (data.token) {
      yield put(authSetToken(data.token));
      yield call(refreshUser);
      yield put(modalSetShown(false));
      return;
    }
  } catch (e) {
    yield put(userSetLoginError(e.message));
  }
}

function* authSaga() {
  yield takeEvery(REHYDRATE, checkUserSaga);
  yield takeLatest([REHYDRATE, AUTH_USER_ACTIONS.LOGGED_IN], startPollingSaga);

  yield takeLatest(AUTH_USER_ACTIONS.LOGOUT, logoutSaga);
  yield takeLatest(AUTH_USER_ACTIONS.SEND_LOGIN_REQUEST, sendLoginRequestSaga);
  yield takeLatest(AUTH_USER_ACTIONS.GOT_AUTH_POST_MESSAGE, gotPostMessageSaga);
  yield takeLatest(AUTH_USER_ACTIONS.OPEN_PROFILE, openProfile);
  yield takeLatest(AUTH_USER_ACTIONS.LOAD_PROFILE, loadProfile);
  yield takeLatest(AUTH_USER_ACTIONS.GET_MESSAGES, getMessages);
  yield takeLatest(AUTH_USER_ACTIONS.SEND_MESSAGE, sendMessage);
  yield takeLatest(AUTH_USER_ACTIONS.SET_LAST_SEEN_MESSAGES, setLastSeenMessages);
  yield takeLatest(AUTH_USER_ACTIONS.PATCH_USER, patchUser);
  yield takeLatest(AUTH_USER_ACTIONS.REQUEST_RESTORE_CODE, requestRestoreCode);
  yield takeLatest(AUTH_USER_ACTIONS.SHOW_RESTORE_MODAL, showRestoreModal);
  yield takeLatest(AUTH_USER_ACTIONS.RESTORE_PASSWORD, restorePassword);
  yield takeLatest(AUTH_USER_ACTIONS.GET_SOCIALS, getSocials);
  yield takeLatest(AUTH_USER_ACTIONS.DROP_SOCIAL, dropSocial);
  yield takeLatest(AUTH_USER_ACTIONS.ATTACH_SOCIAL, attachSocial);
  yield takeLatest(AUTH_USER_ACTIONS.LOGIN_WITH_SOCIAL, loginWithSocial);
}

export default authSaga;
