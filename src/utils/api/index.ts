import axios, { AxiosError, AxiosResponse } from 'axios';
import { API } from '~/constants/api';
import { getMOBXStore } from '~/store';
import { assocPath } from 'ramda';

export const api = axios.create({
  baseURL: API.BASE,
});

// Pass token to axios
api.interceptors.request.use(options => {
  const token = getMOBXStore().auth.token;

  if (!token) {
    return options;
  }

  return assocPath(['headers', 'authorization'], `Bearer ${token}`, options);
});

// Logout on 401
api.interceptors.response.use(undefined, (error: AxiosError<{ error: string }>) => {
  if (error.response?.status === HTTP_RESPONSES.UNAUTHORIZED) {
    getMOBXStore().auth.logout();
  }

  error.message = error?.response?.data?.error || error?.response?.statusText || error.message;

  throw error;
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

export const cleanResult = <T extends any>(response: AxiosResponse<T>): T => response?.data;
