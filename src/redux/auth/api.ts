import { api, cleanResult, errorMiddleware, resultMiddleware } from '~/utils/api';
import { API } from '~/constants/api';
import { IResultWithStatus } from '~/redux/types';
import {
  ApiAttachSocialRequest,
  ApiAttachSocialResult,
  ApiAuthGetUpdatesRequest,
  ApiAuthGetUpdatesResult,
  ApiAuthGetUserProfileRequest,
  ApiAuthGetUserProfileResult,
  ApiAuthGetUserResult,
  ApiCheckRestoreCodeRequest,
  ApiCheckRestoreCodeResult,
  ApiDropSocialRequest,
  ApiDropSocialResult,
  ApiGetSocialsResult,
  ApiLoginWithSocialRequest,
  ApiLoginWithSocialResult,
  ApiRestoreCodeRequest,
  ApiRestoreCodeResult,
  ApiUpdateUserRequest,
  ApiUpdateUserResult,
  ApiUserLoginRequest,
  ApiUserLoginResult,
} from './types';

export const apiUserLogin = ({ username, password }: ApiUserLoginRequest) =>
  api
    .post<ApiUserLoginResult>(API.USER.LOGIN, { username, password })
    .then(cleanResult);

export const apiAuthGetUser = () => api.get<ApiAuthGetUserResult>(API.USER.ME).then(cleanResult);

export const apiAuthGetUserProfile = ({ username }: ApiAuthGetUserProfileRequest) =>
  api.get<ApiAuthGetUserProfileResult>(API.USER.PROFILE(username)).then(cleanResult);

export const apiAuthGetUpdates = ({ exclude_dialogs, last }: ApiAuthGetUpdatesRequest) =>
  api
    .get<ApiAuthGetUpdatesResult>(API.USER.GET_UPDATES, { params: { exclude_dialogs, last } })
    .then(cleanResult);

export const apiUpdateUser = ({ user }: ApiUpdateUserRequest) =>
  api.patch<ApiUpdateUserResult>(API.USER.ME, user).then(cleanResult);

export const apiRequestRestoreCode = ({ field }): Promise<IResultWithStatus<{}>> =>
  api
    .post(API.USER.REQUEST_CODE(), { field })
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const apiCheckRestoreCode = ({ code }: ApiCheckRestoreCodeRequest) =>
  api.get<ApiCheckRestoreCodeResult>(API.USER.REQUEST_CODE(code)).then(cleanResult);

export const apiRestoreCode = ({ code, password }: ApiRestoreCodeRequest) =>
  api
    .post<ApiRestoreCodeResult>(API.USER.REQUEST_CODE(code), { password })
    .then(cleanResult);

export const apiGetSocials = () =>
  api.get<ApiGetSocialsResult>(API.USER.GET_SOCIALS).then(cleanResult);

export const apiDropSocial = ({ id, provider }: ApiDropSocialRequest) =>
  api.delete<ApiDropSocialResult>(API.USER.DROP_SOCIAL(provider, id)).then(cleanResult);

export const apiAttachSocial = ({ token }: ApiAttachSocialRequest) =>
  api
    .post<ApiAttachSocialResult>(API.USER.ATTACH_SOCIAL, { token })
    .then(cleanResult);

export const apiLoginWithSocial = ({ token, username, password }: ApiLoginWithSocialRequest) =>
  api
    .post<ApiLoginWithSocialResult>(API.USER.LOGIN_WITH_SOCIAL, { token, username, password })
    .then(cleanResult);
