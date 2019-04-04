import { createReducer } from 'reduxsauce';
import * as ACTIONS from "$redux/user/actions";
import { USER_ACTIONS } from "$redux/user/constants";

export interface IUserProfile {
  id: number,
  username: string,
  email: string,
  role: string,
  activated: boolean,
}

export interface IUserFormStateLogin {
  error: string,
}

export type IRootState = Readonly<{
  profile: IUserProfile,
  form_state: {
    login: IUserFormStateLogin,
  },
}>;

type UnsafeReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
interface ActionHandler<T> {
  (state: IRootState, payload: UnsafeReturnType<T>): IRootState;
}

const someActionHandler: ActionHandler<typeof ACTIONS.someAction> = (state) => {
  return { ...state };
};

const HANDLERS = {
  [USER_ACTIONS.SOME_ACTION]: someActionHandler,
};

const INITIAL_STATE: IRootState = {
  profile: {
    id: 0,
    username: '',
    email: '',
    role: '',
    activated: false,
  },
  form_state: {
    login: {
      error: '',
    }
  }
};

export default createReducer(INITIAL_STATE, HANDLERS);
