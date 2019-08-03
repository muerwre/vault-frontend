import {api, authMiddleware, errorMiddleware, resultMiddleware} from "~/utils/api";
import { API } from "~/constants/api";
import { IApiUser } from "~/redux/auth/constants";
import {IResultWithStatus} from "~/redux/types";
import {userLoginTransform} from "~/redux/auth/transforms";

export const apiUserLogin = (
  { username, password }:
  { username: string, password: string }
): Promise<IResultWithStatus<{ token: string, status?: number, user?: IApiUser }>> => (
  api.post(API.USER.LOGIN, { username, password })
    .then(resultMiddleware)
    .catch(errorMiddleware)
    .then(userLoginTransform)
);
