import axios, { AxiosRequestConfig } from 'axios';
import { API } from '~/constants/api';
import { store } from '~/redux/store';
import { push } from 'connected-react-router';
import { IResultWithStatus } from '~/redux/types';

export const authMiddleware = r => {
  store.dispatch(push('/login'));
  return r;
};

export const api = axios.create({
  baseURL: API.BASE,
});

export const HTTP_RESPONSES = {
  SUCCESS: 200,
  CREATED: 201,
  CONNECTION_REFUSED: 408,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
};

export const resultMiddleware = <T extends {}>({
  status,
  data,
}: {
  status: number;
  data: T;
}): { status: number; data: T } => {
  return data && { status, data };
};

export const errorMiddleware = <T extends any>(debug): IResultWithStatus<T> =>
  debug && debug.response
    ? debug.response
    : {
      status: HTTP_RESPONSES.CONNECTION_REFUSED,
      data: null,
      debug,
      error: 'Network_Disconnected',
    };

export const configWithToken = (
  access: string,
  config: AxiosRequestConfig = {},
): AxiosRequestConfig => ({
  ...config,
  headers: { ...(config.headers || {}), Authorization: `Bearer ${access}` },
});
