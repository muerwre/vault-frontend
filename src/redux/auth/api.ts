import {
  api,
  authMiddleware,
  errorMiddleware,
  resultMiddleware,
  configWithToken,
} from '~/utils/api';
import { API } from '~/constants/api';
import { IResultWithStatus } from '~/redux/types';
import { userLoginTransform } from '~/redux/auth/transforms';

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
