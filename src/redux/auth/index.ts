import { EMPTY_USER } from '~/redux/auth/constants';
import { createReducer } from '~/utils/reducer';
import { IAuthState } from '~/redux/auth/types';
import { AUTH_USER_HANDLERS } from '~/redux/auth/handlers';

const HANDLERS = {
  ...AUTH_USER_HANDLERS,
};

const INITIAL_STATE: IAuthState = {
  token: '',
  user: { ...EMPTY_USER },

  updates: {
    last: '',
    notifications: [],
    boris_commented_at: '',
  },

  login: {
    error: '',
    is_loading: false,
    is_registering: true,
  },

  profile: {
    tab: 'profile',
    is_loading: true,

    user: undefined,
    patch_errors: {},

    socials: {
      accounts: [],
      error: '',
      is_loading: false,
    },
  },

  restore: {
    code: '',
    user: undefined,
    is_loading: false,
    is_succesfull: false,
    error: '',
  },

  register_social: {
    errors: {
      username: '',
      password: '',
    },
    error: '',
    token: '',
    is_loading: false,
  },
};

export default createReducer(INITIAL_STATE, HANDLERS);
