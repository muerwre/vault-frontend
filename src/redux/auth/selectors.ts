import { IState } from '~/redux/store';

export const selectAuth = (state: IState) => state.auth;
export const selectUser = (state: IState) => state.auth.user;
export const selectAuthIsTester = (state: IState) => state.auth.is_tester;
export const selectAuthLogin = (state: IState) => state.auth.login;
export const selectAuthProfile = (state: IState) => state.auth.profile;
export const selectAuthUser = (state: IState) => state.auth.user;
export const selectAuthUpdates = (state: IState) => state.auth.updates;
export const selectAuthRestore = (state: IState) => state.auth.restore;
export const selectAuthRegisterSocial = (state: IState) => state.auth.register_social;
