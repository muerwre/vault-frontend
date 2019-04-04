import axios from 'axios';
import { API } from "$constants/api";
import { store } from '$redux/store';
import { push } from "connected-react-router";

export const authMiddleware = r => {
  store.dispatch(push('/login'));
  return r;
};

export const api = axios.create({
  baseURL: API.BASE,
});
