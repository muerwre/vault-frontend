import {IToken, IUser} from "~/redux/auth/types";

export const AUTH_USER_ACTIONS = {
  SEND_LOGIN_REQUEST: 'SEND_LOGIN_REQUEST',
  SET_LOGIN_ERROR: 'SET_LOGIN_ERROR',
  SET_USER: 'SET_USER',
  SET_TOKEN: 'SET_TOKEN',
};

export const USER_ERRORS = {
  INVALID_CREDENTIALS: 'Неверное имя пользователя или пароль. Очень жаль.',
  EMPTY_CREDENTIALS: 'Давайте введем логин и пароль. Это обязательно.'
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
  is_activated: false,
  is_user: false,
};

export interface IApiUser {
  id: number,
  username: string,
  email: string,
  role: string,
  activated: boolean,
  createdAt: string,
  updatedAt: string,
}