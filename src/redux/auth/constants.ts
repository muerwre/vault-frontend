import { IToken, IUser } from '~/redux/auth/types';

export const AUTH_USER_ACTIONS = {
  SEND_LOGIN_REQUEST: 'SEND_LOGIN_REQUEST',
  SET_LOGIN_ERROR: 'SET_LOGIN_ERROR',
  SET_USER: 'SET_USER',
  SET_TOKEN: 'SET_TOKEN',

  LOGOUT: 'LOGOUT',
  LOGGED_IN: 'LOGGED_IN',

  GOT_AUTH_POST_MESSAGE: 'GOT_POST_MESSAGE',
  OPEN_PROFILE: 'OPEN_PROFILE',
  SET_PROFILE: 'SET_PROFILE',
  GET_MESSAGES: 'GET_MESSAGES',
  SEND_MESSAGE: 'SEND_MESSAGE',

  SET_UPDATES: 'SET_UPDATES',
  SET_LAST_SEEN_MESSAGES: 'SET_LAST_SEEN_MESSAGES',
  PATCH_USER: 'PATCH_USER',

  SET_RESTORE: 'SET_RESTORE',
  REQUEST_RESTORE_CODE: 'REQUEST_RESTORE_CODE',
  RESTORE_PASSWORD: 'RESTORE_PASSWORD',
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
  access: null,
  refresh: null,
};

export const EMPTY_USER: IUser = {
  id: null,
  role: USER_ROLES.GUEST,
  email: null,
  name: null,
  username: null,
  photo: null,
  cover: null,
  is_activated: false,
  is_user: false,
  fullname: null,
  description: null,

  last_seen: null,
  last_seen_messages: null,
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
