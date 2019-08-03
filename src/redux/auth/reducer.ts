import {EMPTY_TOKEN, EMPTY_USER, AUTH_USER_ACTIONS} from "~/redux/auth/constants";
import { createReducer } from "~/utils/reducer";
import {IAuthState} from "~/redux/auth/types";
import {AUTH_USER_HANDLERS} from "~/redux/auth/handlers";

const HANDLERS = {
  ...AUTH_USER_HANDLERS,
};

const INITIAL_STATE: IAuthState = {
  token: { ...EMPTY_TOKEN },
  user: { ...EMPTY_USER },
  login: {
    error: null,
    is_loading: false,
  },
};

export default createReducer(INITIAL_STATE, HANDLERS);
