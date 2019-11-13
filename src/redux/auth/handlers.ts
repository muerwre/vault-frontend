import { AUTH_USER_ACTIONS } from '~/redux/auth/constants';
import * as ActionCreators from '~/redux/auth/actions';
import { IAuthState } from '~/redux/auth/types';

interface ActionHandler<T> {
  (state: IAuthState, payload: T extends (...args: any[]) => infer R ? R : any): IAuthState;
}

const setLoginError: ActionHandler<typeof ActionCreators.userSetLoginError> = (
  state,
  { error }
) => ({
  ...state,
  login: {
    ...state.login,
    error,
  },
});

const setUser: ActionHandler<typeof ActionCreators.authSetUser> = (state, { profile }) => ({
  ...state,
  user: {
    ...state.user,
    ...profile,
  },
});

const setToken: ActionHandler<typeof ActionCreators.authSetToken> = (state, { token }) => ({
  ...state,
  token,
});

const setProfile: ActionHandler<typeof ActionCreators.authSetProfile> = (state, { profile }) => ({
  ...state,
  profile: {
    ...state.profile,
    ...profile,
  },
});

const setUpdates: ActionHandler<typeof ActionCreators.authSetUpdates> = (state, { updates }) => ({
  ...state,
  updates: {
    ...state.updates,
    ...updates,
  },
});

const setLastSeenMessages: ActionHandler<typeof ActionCreators.authSetLastSeenMessages> = (
  state,
  { last_seen_messages }
) => ({
  ...state,
  user: {
    ...state.user,
    last_seen_messages,
  },
});

export const AUTH_USER_HANDLERS = {
  [AUTH_USER_ACTIONS.SET_LOGIN_ERROR]: setLoginError,
  [AUTH_USER_ACTIONS.SET_USER]: setUser,
  [AUTH_USER_ACTIONS.SET_TOKEN]: setToken,
  [AUTH_USER_ACTIONS.SET_PROFILE]: setProfile,
  [AUTH_USER_ACTIONS.SET_UPDATES]: setUpdates,
  [AUTH_USER_ACTIONS.SET_LAST_SEEN_MESSAGES]: setLastSeenMessages,
};
