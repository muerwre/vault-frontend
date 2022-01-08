import { IToken, IUser } from '~/redux/auth/types';

export const AUTH_USER_ACTIONS = {
  SEND_LOGIN_REQUEST: 'SEND_LOGIN_REQUEST',
  SET_LOGIN_ERROR: 'SET_LOGIN_ERROR',
  SET_STATE: 'SET_STATE',
  SET_USER: 'SET_USER',
  SET_TOKEN: 'SET_TOKEN',

  LOGOUT: 'LOGOUT',
  LOGGED_IN: 'LOGGED_IN',

  GOT_AUTH_POST_MESSAGE: 'GOT_POST_MESSAGE',
  OPEN_PROFILE: 'OPEN_PROFILE',

  SET_UPDATES: 'SET_UPDATES',
  SET_LAST_SEEN_MESSAGES: 'SET_LAST_SEEN_MESSAGES',

  SET_RESTORE: 'SET_RESTORE',
  REQUEST_RESTORE_CODE: 'REQUEST_RESTORE_CODE',
  SHOW_RESTORE_MODAL: 'SHOW_RESTORE_MODAL',
  RESTORE_PASSWORD: 'RESTORE_PASSWORD',

  GET_SOCIALS: 'GET_SOCIALS',
  DROP_SOCIAL: 'DROP_SOCIAL',
  ADD_SOCIAL: 'ADD_SOCIAL',
  SET_SOCIALS: 'SET_SOCIALS',
  ATTACH_SOCIAL: 'ATTACH_SOCIAL',
  LOGIN_WITH_SOCIAL: 'LOGIN_WITH_SOCIAL',
  GOT_OAUTH_LOGIN_EVENT: 'GOT_OAUTH_EVENT',

  SET_REGISTER_SOCIAL: 'SET_REGISTER_SOCIAL',
  SET_REGISTER_SOCIAL_ERRORS: 'SET_REGISTER_SOCIAL_ERRORS',
  SEND_REGISTER_SOCIAL: 'SEND_REGISTER_SOCIAL',
};

export const USER_ERRORS = {
  UNAUTHORIZED: 'Вы не авторизованы',
  INVALID_CREDENTIALS: 'Неверное имя пользователя или пароль. Очень жаль.',
  EMPTY_CREDENTIALS: 'Давайте введем логин и пароль. Это обязательно.',
};

export const USER_STATUSES = {
  404: USER_ERRORS.INVALID_CREDENTIALS,
};

export const USER_ROLES = {
  GUEST: 'guest',
  USER: 'user',
  ADMIN: 'admin',
};

export const EMPTY_TOKEN: IToken = {
  access: '',
  refresh: '',
};

export const EMPTY_USER: IUser = {
  id: 0,
  role: USER_ROLES.GUEST,
  email: '',
  name: '',
  username: '',
  photo: undefined,
  cover: undefined,
  is_activated: false,
  is_user: false,
  fullname: '',
  description: '',

  last_seen: '',
  last_seen_messages: '',
  last_seen_boris: '',
};

export interface IApiUser {
  id: number;
  username: string;
  email: string;
  role: string;
  activated: boolean;
  createdAt: string;
  updatedAt: string;
}
