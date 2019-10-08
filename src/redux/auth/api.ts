import { api, errorMiddleware, resultMiddleware, configWithToken } from '~/utils/api';
import { API } from '~/constants/api';
import { IResultWithStatus } from '~/redux/types';
import { userLoginTransform } from '~/redux/auth/transforms';
import { IUser } from './types';

export const apiUserLogin = ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<IResultWithStatus<{ token: string; status?: number }>> =>
  api
    .post(API.USER.LOGIN, { username, password })
    .then(resultMiddleware)
    .catch(errorMiddleware)
    .then(userLoginTransform);

export const apiAuthGetUser = ({ access }): Promise<IResultWithStatus<{ user: IUser }>> =>
  api
    .get(API.USER.ME, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);
