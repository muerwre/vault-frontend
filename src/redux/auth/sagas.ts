import { call, delay, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { AUTH_USER_ACTIONS, EMPTY_USER, USER_ROLES } from '~/redux/auth/constants';
import {
  authAttachSocial,
  authDropSocial,
  authGotOauthLoginEvent,
  authLoadProfile,
  authLoggedIn,
  authLoginWithSocial,
  authOpenProfile,
  authPatchUser,
  authRequestRestoreCode,
  authRestorePassword,
  authSendRegisterSocial,
  authSetLastSeenMessages,
  authSetProfile,
  authSetRegisterSocial,
  authSetRegisterSocialErrors,
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
  apiAuthGetUserProfile,
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
  selectAuthRegisterSocial,
  selectAuthRestore,
  selectAuthUpdates,
  selectAuthUser,
} from './selectors';
import { OAUTH_EVENT_TYPES, Unwrap } from '../types';
import { REHYDRATE, RehydrateAction } from 'redux-persist';
import { selectModal } from '~/redux/modal/selectors';
import { DIALOGS } from '~/redux/modal/constants';
import { ERRORS } from '~/constants/errors';
import { messagesSet } from '~/redux/messages/actions';
import { SagaIterator } from 'redux-saga';
import { isEmpty } from 'ramda';

function* setTokenSaga({ token }: ReturnType<typeof authSetToken>) {
  localStorage.setItem('token', token);
}

function* sendLoginRequestSaga({ username, password }: ReturnType<typeof userSendLoginRequest>) {
  if (!username || !password) return;

  try {
    const { token, user }: Unwrap<typeof apiUserLogin> = yield call(apiUserLogin, {
      username,
      password,
    });

    yield put(authSetToken(token));
    yield put(authSetUser({ ...user, is_user: true }));
    yield put(authLoggedIn());
    yield put(modalSetShown(false));
  } catch (error) {
    yield put(userSetLoginError(error.message));
  }
}

function* refreshUser() {
  const { token }: ReturnType<typeof selectAuth> = yield select(selectAuth);

  if (!token) return;

  try {
    const { user }: Unwrap<typeof apiAuthGetUser> = yield call(apiAuthGetUser);

    yield put(authSetUser({ ...user, is_user: true }));
  } catch (e) {
    yield put(
      authSetUser({
        ...EMPTY_USER,
        is_user: false,
      })
    );
  }
}

function* checkUserSaga({ key }: RehydrateAction) {
  if (key !== 'auth') return;
  yield call(refreshUser);
}

function* gotPostMessageSaga({ token }: ReturnType<typeof gotAuthPostMessage>) {
  yield put(authSetToken(token));
  yield call(refreshUser);

  const { is_shown, dialog }: ReturnType<typeof selectModal> = yield select(selectModal);

  if (is_shown && dialog === DIALOGS.LOGIN) yield put(modalSetShown(false));
}

function* logoutSaga() {
  yield put(authSetToken(''));
  yield put(authSetUser({ ...EMPTY_USER }));
  yield put(
    authSetUpdates({
      last: '',
      notifications: [],
    })
  );
}

function* loadProfile({ username }: ReturnType<typeof authLoadProfile>): SagaIterator<boolean> {
  yield put(authSetProfile({ is_loading: true }));

  try {
    const { user }: Unwrap<typeof apiAuthGetUserProfile> = yield call(apiAuthGetUserProfile, {
      username,
    });

    yield put(authSetProfile({ is_loading: false, user }));
    yield put(messagesSet({ messages: [] }));
    return true;
  } catch (error) {
    return false;
  }
}

function* openProfile({ username, tab = 'profile' }: ReturnType<typeof authOpenProfile>) {
  yield put(modalShowDialog(DIALOGS.PROFILE));
  yield put(authSetProfile({ tab }));

  const success: Unwrap<typeof loadProfile> = yield call(loadProfile, authLoadProfile(username));

  if (!success) {
    return yield put(modalSetShown(false));
  }
}

function* getUpdates() {
  try {
    const user: ReturnType<typeof selectAuthUser> = yield select(selectAuthUser);

    if (!user || !user.is_user || user.role === USER_ROLES.GUEST || !user.id) return;

    const modal: ReturnType<typeof selectModal> = yield select(selectModal);
    const profile: ReturnType<typeof selectAuthProfile> = yield select(selectAuthProfile);
    const { last, boris_commented_at }: ReturnType<typeof selectAuthUpdates> = yield select(
      selectAuthUpdates
    );
    const exclude_dialogs =
      modal.is_shown && modal.dialog === DIALOGS.PROFILE && profile.user?.id ? profile.user.id : 0;

    const data: Unwrap<typeof apiAuthGetUpdates> = yield call(apiAuthGetUpdates, {
      exclude_dialogs,
      last: last || user.last_seen_messages,
    });

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
  } catch (error) {}
}

function* startPollingSaga() {
  while (true) {
    yield call(getUpdates);
    yield delay(60000);
  }
}

function* setLastSeenMessages({ last_seen_messages }: ReturnType<typeof authSetLastSeenMessages>) {
  if (!Date.parse(last_seen_messages)) return;

  yield call(apiUpdateUser, { user: { last_seen_messages } });
}

function* patchUser(payload: ReturnType<typeof authPatchUser>) {
  const me: ReturnType<typeof selectAuthUser> = yield select(selectAuthUser);

  try {
    const { user }: Unwrap<typeof apiUpdateUser> = yield call(apiUpdateUser, {
      user: payload.user,
    });

    yield put(authSetUser({ ...me, ...user }));
    yield put(authSetProfile({ user: { ...me, ...user }, tab: 'profile' }));
  } catch (error) {
    if (isEmpty(error.response.data.errors)) return;

    yield put(authSetProfile({ patch_errors: error.response.data.errors }));
  }
}

function* requestRestoreCode({ field }: ReturnType<typeof authRequestRestoreCode>) {
  if (!field) return;

  try {
    yield put(authSetRestore({ error: '', is_loading: true }));
    yield call(apiRequestRestoreCode, {
      field,
    });

    yield put(authSetRestore({ is_loading: false, is_succesfull: true }));
  } catch (error) {
    return yield put(authSetRestore({ is_loading: false, error: error.message }));
  }
}

function* showRestoreModal({ code }: ReturnType<typeof authShowRestoreModal>) {
  try {
    if (!code && !code.length) {
      return yield put(authSetRestore({ error: ERRORS.CODE_IS_INVALID, is_loading: false }));
    }

    yield put(authSetRestore({ user: undefined, is_loading: true }));

    const data: Unwrap<typeof apiCheckRestoreCode> = yield call(apiCheckRestoreCode, { code });

    yield put(authSetRestore({ user: data.user, code, is_loading: false }));
    yield put(modalShowDialog(DIALOGS.RESTORE_PASSWORD));
  } catch (error) {
    yield put(
      authSetRestore({ is_loading: false, error: error.message || ERRORS.CODE_IS_INVALID })
    );
    yield put(modalShowDialog(DIALOGS.RESTORE_PASSWORD));
  }
}

function* restorePassword({ password }: ReturnType<typeof authRestorePassword>) {
  try {
    if (!password) return;

    yield put(authSetRestore({ is_loading: true }));
    const { code }: ReturnType<typeof selectAuthRestore> = yield select(selectAuthRestore);

    if (!code) {
      return yield put(authSetRestore({ error: ERRORS.CODE_IS_INVALID, is_loading: false }));
    }

    const data: Unwrap<typeof apiRestoreCode> = yield call(apiRestoreCode, { code, password });

    yield put(authSetToken(data.token));
    yield put(authSetUser(data.user));

    yield put(authSetRestore({ is_loading: false, is_succesfull: true, error: '' }));

    yield call(refreshUser);
  } catch (error) {
    return yield put(
      authSetRestore({ is_loading: false, error: error.message || ERRORS.CODE_IS_INVALID })
    );
  }
}

function* getSocials() {
  try {
    yield put(authSetSocials({ is_loading: true, error: '' }));
    const data: Unwrap<typeof apiGetSocials> = yield call(apiGetSocials);
    yield put(authSetSocials({ accounts: data.accounts }));
  } catch (error) {
    yield put(authSetSocials({ error: error.message }));
  } finally {
    yield put(authSetSocials({ is_loading: false }));
  }
}

// TODO: start from here
function* dropSocial({ provider, id }: ReturnType<typeof authDropSocial>) {
  try {
    yield put(authSetSocials({ error: '' }));
    yield call(apiDropSocial, {
      id,
      provider,
    });

    yield call(getSocials);
  } catch (error) {
    yield put(authSetSocials({ error: error.message }));
  }
}

function* attachSocial({ token }: ReturnType<typeof authAttachSocial>) {
  try {
    if (!token) return;

    yield put(authSetSocials({ error: '', is_loading: true }));

    const data: Unwrap<typeof apiAttachSocial> = yield call(apiAttachSocial, {
      token,
    });

    const {
      socials: { accounts },
    }: ReturnType<typeof selectAuthProfile> = yield select(selectAuthProfile);

    if (accounts.some(it => it.id === data.account.id && it.provider === data.account.provider)) {
      return;
    }

    yield put(authSetSocials({ accounts: [...accounts, data.account] }));
  } catch (e) {
    yield put(authSetSocials({ error: e.message }));
  } finally {
    yield put(authSetSocials({ is_loading: false }));
  }
}

function* loginWithSocial({ token }: ReturnType<typeof authLoginWithSocial>) {
  try {
    yield put(userSetLoginError(''));

    const data: Unwrap<typeof apiLoginWithSocial> = yield call(apiLoginWithSocial, {
      token,
    });

    // Backend asks us for account registration
    if (data?.needs_register) {
      yield put(authSetRegisterSocial({ token }));
      yield put(modalShowDialog(DIALOGS.LOGIN_SOCIAL_REGISTER));
      return;
    }

    if (data.token) {
      yield put(authSetToken(data.token));
      yield call(refreshUser);
      yield put(modalSetShown(false));
      return;
    }
  } catch (error) {
    yield put(userSetLoginError(error.message));
  }
}

function* gotOauthLoginEvent({ event }: ReturnType<typeof authGotOauthLoginEvent>) {
  if (!event?.type) return;

  switch (event.type) {
    case OAUTH_EVENT_TYPES.OAUTH_PROCESSED:
      return yield put(authLoginWithSocial(event?.payload?.token));

    case OAUTH_EVENT_TYPES.OAUTH_ERROR:
      return yield put(userSetLoginError(event?.payload?.error));

    default:
      return;
  }
}

function* authRegisterSocial({ username, password }: ReturnType<typeof authSendRegisterSocial>) {
  try {
    yield put(authSetRegisterSocial({ error: '' }));

    const { token }: ReturnType<typeof selectAuthRegisterSocial> = yield select(
      selectAuthRegisterSocial
    );

    const data: Unwrap<typeof apiLoginWithSocial> = yield call(apiLoginWithSocial, {
      token,
      username,
      password,
    });

    if (data?.errors) {
      yield put(authSetRegisterSocialErrors(data.errors));
      return;
    }

    if (data.token) {
      yield put(authSetToken(data.token));
      yield call(refreshUser);
      yield put(modalSetShown(false));
      return;
    }
  } catch (error) {
    yield put(authSetRegisterSocial({ error: error.message }));
  }
}

function* authSaga() {
  yield takeEvery(REHYDRATE, checkUserSaga);
  yield takeLatest([REHYDRATE, AUTH_USER_ACTIONS.LOGGED_IN], startPollingSaga);

  yield takeLatest(AUTH_USER_ACTIONS.LOGOUT, logoutSaga);
  yield takeLatest(AUTH_USER_ACTIONS.SET_TOKEN, setTokenSaga);
  yield takeLatest(AUTH_USER_ACTIONS.SEND_LOGIN_REQUEST, sendLoginRequestSaga);
  yield takeLatest(AUTH_USER_ACTIONS.GOT_AUTH_POST_MESSAGE, gotPostMessageSaga);
  yield takeLatest(AUTH_USER_ACTIONS.OPEN_PROFILE, openProfile);
  yield takeLatest(AUTH_USER_ACTIONS.LOAD_PROFILE, loadProfile);
  yield takeLatest(AUTH_USER_ACTIONS.SET_LAST_SEEN_MESSAGES, setLastSeenMessages);
  yield takeLatest(AUTH_USER_ACTIONS.PATCH_USER, patchUser);
  yield takeLatest(AUTH_USER_ACTIONS.REQUEST_RESTORE_CODE, requestRestoreCode);
  yield takeLatest(AUTH_USER_ACTIONS.SHOW_RESTORE_MODAL, showRestoreModal);
  yield takeLatest(AUTH_USER_ACTIONS.RESTORE_PASSWORD, restorePassword);
  yield takeLatest(AUTH_USER_ACTIONS.GET_SOCIALS, getSocials);
  yield takeLatest(AUTH_USER_ACTIONS.DROP_SOCIAL, dropSocial);
  yield takeLatest(AUTH_USER_ACTIONS.ATTACH_SOCIAL, attachSocial);
  yield takeLatest(AUTH_USER_ACTIONS.LOGIN_WITH_SOCIAL, loginWithSocial);
  yield takeEvery(AUTH_USER_ACTIONS.GOT_OAUTH_LOGIN_EVENT, gotOauthLoginEvent);
  yield takeEvery(AUTH_USER_ACTIONS.SEND_REGISTER_SOCIAL, authRegisterSocial);
}

export default authSaga;
