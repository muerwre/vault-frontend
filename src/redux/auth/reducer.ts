import { EMPTY_USER } from '~/redux/auth/constants';
import { createReducer } from '~/utils/reducer';
import { IAuthState } from '~/redux/auth/types';
import { AUTH_USER_HANDLERS } from '~/redux/auth/handlers';

const HANDLERS = {
  ...AUTH_USER_HANDLERS,
};

const INITIAL_STATE: IAuthState = {
  token: null,
  user: { ...EMPTY_USER },

  updates: {
    last: null,
    notifications: [],
  },

  login: {
    error: null,
    is_loading: false,
  },

  profile: {
    tab: 'profile',
    is_loading: true,
    is_loading_messages: true,
    is_sending_messages: false,
    user: null,
    messages: [],
    messages_error: null,
  },
};

export default createReducer(INITIAL_STATE, HANDLERS);
