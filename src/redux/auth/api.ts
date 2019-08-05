import {
  api,
  authMiddleware,
  errorMiddleware,
  resultMiddleware,
  configWithToken,
} from '~/utils/api';
import { API } from '~/constants/api';
import { IResultWithStatus } from '~/redux/types';
import { authMeTransform, userLoginTransform } from '~/redux/auth/transforms';
import { IUser } from '~/redux/auth/types';

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

export const getAuthSelf = ({ access }): Promise<IResultWithStatus<{ user: IUser }>> =>
  api
    .get(API.USER.ME, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware)
    .then(authMeTransform);
