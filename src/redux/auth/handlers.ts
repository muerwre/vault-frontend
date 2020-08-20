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

const setRestore: ActionHandler<typeof ActionCreators.authSetRestore> = (state, { restore }) => ({
  ...state,
  restore: {
    ...state.restore,
    ...restore,
  },
});

const setSocials: ActionHandler<typeof ActionCreators.authSetSocials> = (state, { socials }) => ({
  ...state,
  profile: {
    ...state.profile,
    socials: {
      ...state.profile.socials,
      ...socials,
    },
  },
});

const setRegisterSocial: ActionHandler<typeof ActionCreators.authSetRegisterSocial> = (
  state,
  { register_social }
) => ({
  ...state,
  register_social: {
    ...state.register_social,
    ...register_social,
  },
});

const setRegisterSocialErrors: ActionHandler<typeof ActionCreators.authSetRegisterSocialErrors> = (
  state,
  { errors }
) => ({
  ...state,
  register_social: {
    ...state.register_social,
    errors: {
      ...state.register_social.errors,
      ...errors,
    },
  },
});

export const AUTH_USER_HANDLERS = {
  [AUTH_USER_ACTIONS.SET_LOGIN_ERROR]: setLoginError,
  [AUTH_USER_ACTIONS.SET_USER]: setUser,
  [AUTH_USER_ACTIONS.SET_TOKEN]: setToken,
  [AUTH_USER_ACTIONS.SET_PROFILE]: setProfile,
  [AUTH_USER_ACTIONS.SET_UPDATES]: setUpdates,
  [AUTH_USER_ACTIONS.SET_LAST_SEEN_MESSAGES]: setLastSeenMessages,
  [AUTH_USER_ACTIONS.SET_RESTORE]: setRestore,
  [AUTH_USER_ACTIONS.SET_SOCIALS]: setSocials,
  [AUTH_USER_ACTIONS.SET_REGISTER_SOCIAL]: setRegisterSocial,
  [AUTH_USER_ACTIONS.SET_REGISTER_SOCIAL_ERRORS]: setRegisterSocialErrors,
};
