import * as ActionCreators from "~/redux/user/actions";
import { USER_ACTIONS } from "~/redux/user/constants";
import { createReducer } from "~/utils/reducer";

export interface IUserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  token: string;

  is_activated: boolean;
  is_user: boolean;
}

export interface IUserFormStateLogin {
  error: string;
}

export type IUserState = Readonly<{
  profile: IUserProfile;
  form_state: {
    login: IUserFormStateLogin;
  };
}>;

type UnsafeReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
interface ActionHandler<T> {
  (state: IUserState, payload: UnsafeReturnType<T>): IUserState;
}

const setLoginErrorHandler: ActionHandler<typeof ActionCreators.userSetLoginError> = (
  state,
  { error }
) => ({
  ...state,
  form_state: {
    ...state.form_state,
    login: {
      ...state.form_state.login,
      error
    }
  }
});

const setUserHandler: ActionHandler<typeof ActionCreators.userSetUser> = (state, { profile }) => ({
  ...state,
  profile: {
    ...state.profile,
    ...profile
  }
});

const HANDLERS = {
  [USER_ACTIONS.SET_LOGIN_ERROR]: setLoginErrorHandler,
  [USER_ACTIONS.SET_USER]: setUserHandler
};

const INITIAL_STATE: IUserState = {
  profile: {
    id: 0,
    username: "",
    email: "",
    role: "",
    token: "",
    is_activated: false,
    is_user: false
  },
  form_state: {
    login: {
      error: ""
    }
  }
};

export default createReducer(INITIAL_STATE, HANDLERS);
