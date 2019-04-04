export const USER_ACTIONS = {
  SEND_LOGIN_REQUEST: 'SEND_LOGIN_REQUEST',
  SET_LOGIN_ERROR: 'SET_LOGIN_ERROR',
  SET_USER: 'SET_USER',
};

export const USER_ERRORS = {
  INVALID_CREDENTIALS: 'Неверное имя пользователя или пароль. Очень жаль.',
  EMPTY_CREDENTIALS: 'Давайте введем логин и пароль. Это обязательно.'
};

export const USER_STATUSES = {
  404: USER_ERRORS.INVALID_CREDENTIALS,
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
