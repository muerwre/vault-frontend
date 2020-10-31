import axios, { AxiosRequestConfig } from 'axios';
import { push } from 'connected-react-router';
import { API } from '~/constants/api';
import { store } from '~/redux/store';
import { IApiErrorResult, IResultWithStatus } from '~/redux/types';

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

export const resultMiddleware = <T extends any>({ status, data }: { status; data: T }) => ({
  status,
  data,
});

export const errorMiddleware = <T extends any = any>(debug): IResultWithStatus<T> =>
  debug && debug.response
    ? {
        status: debug.response.status,
        data:
          (debug.response.data as T & IApiErrorResult) || (debug.response as T & IApiErrorResult),
        error: debug?.response?.data?.error || debug?.response?.error || 'Неизвестная ошибка',
      }
    : {
        status: HTTP_RESPONSES.CONNECTION_REFUSED,
        data: {} as T & IApiErrorResult & any,
        debug,
        error: 'Ошибка сети',
      };

export const configWithToken = (
  access: string,
  config: AxiosRequestConfig = {}
): AxiosRequestConfig => ({
  ...config,
  headers: { ...(config.headers || {}), Authorization: `Bearer ${access}` },
});
