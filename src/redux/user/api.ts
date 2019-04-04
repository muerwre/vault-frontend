import { api, authMiddleware } from "$utils/api";
import { API } from "$constants/api";
import { IApiUser } from "$redux/user/constants";

export const apiUserLogin = (
  { username, password }:
  { username: string, password: string }
): Promise<{ token: string, status?: number, user?: IApiUser }> => (
  api.post(API.USER.LOGIN, { username, password })
    .then(r => r && r.data && { token: r.data.token, user: r.data.user, status: 200 })
    .catch( (r) => ({ token: '', user: null, status: parseInt(r.response.status) }))
);
