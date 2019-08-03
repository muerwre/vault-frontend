import {IState} from "~/redux/store";

export const selectUser = (state: IState): IState['auth']['user'] => state.auth.user;
export const selectAuthLogin = (state: IState): IState['auth']['login'] => state.auth.login;
