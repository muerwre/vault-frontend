import { IState } from '~/redux/store';

export const selectAuth = (state: IState): IState['auth'] => state.auth;
export const selectUser = (state: IState): IState['auth']['user'] => state.auth.user;
export const selectToken = (state: IState): IState['auth']['token'] => state.auth.token;
export const selectAuthLogin = (state: IState): IState['auth']['login'] => state.auth.login;
export const selectAuthProfile = (state: IState): IState['auth']['profile'] => state.auth.profile;
export const selectAuthUser = (state: IState): IState['auth']['user'] => state.auth.user;
export const selectAuthUpdates = (state: IState): IState['auth']['updates'] => state.auth.updates;
