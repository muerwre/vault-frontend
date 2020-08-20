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
    boris_commented_at: null,
  },

  login: {
    error: null,
    is_loading: false,
    is_registering: true,
  },

  profile: {
    tab: 'profile',
    is_loading: true,
    is_loading_messages: true,
    is_sending_messages: false,
    user: null,
    messages: [],
    messages_error: null,
    patch_errors: {},

    socials: {
      accounts: [],
      error: '',
      is_loading: false,
    },
  },

  restore: {
    code: '',
    user: null,
    is_loading: false,
    is_succesfull: false,
    error: null,
  },

  register_social: {
    errors: {
      username: 'and this',
      password: 'dislike this',
    },
    error: 'dont like this one',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJEYXRhIjp7IlByb3ZpZGVyIjoiZ29vZ2xlIiwiSWQiOiJma2F0dXJvdkBpY2Vyb2NrZGV2LmNvbSIsIkVtYWlsIjoiZmthdHVyb3ZAaWNlcm9ja2Rldi5jb20iLCJUb2tlbiI6InlhMjkuYTBBZkg2U01EeXFGdlRaTExXckhsQm1QdGZIOFNIVGQteWlSYTFKSXNmVXluY2F6MTZ5UGhjRmxydTlDMWFtTEg0aHlHRzNIRkhrVGU0SXFUS09hVVBEREdqR2JQRVFJbGpPME9UbUp2T2RrdEtWNDVoUGpJcTB1cHVLc003UWJLSm1oRWhkMEFVa3YyejVHWlNSMjhaM2VOZVdwTEVYSGV0MW1yNyIsIkZldGNoZWQiOnsiUHJvdmlkZXIiOiJnb29nbGUiLCJJZCI6OTIyMzM3MjAzNjg1NDc3NTgwNywiTmFtZSI6IkZlZG9yIEthdHVyb3YiLCJQaG90byI6Imh0dHBzOi8vbGg2Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8ta1VMYXh0VV9jZTAvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQU1adXVjbkEycTFReU1WLUN0RUtBclRhQzgydE52NTM2QS9waG90by5qcGcifX0sIlR5cGUiOiJvYXV0aF9jbGFpbSJ9.r1MY994BC_g4qRDoDoyNmwLs0qRzBLx6_Ez-3mHQtwg',
    is_loading: false,
  },
};

export default createReducer(INITIAL_STATE, HANDLERS);
