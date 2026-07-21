import { TelegramUser } from '@v9v/ts-react-telegram-login';

import { API } from '~/constants/api';
import { api, unwrap } from '~/utils/api';

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
  ApiUpdatePhotoRequest,
  ApiUpdateUserRequest,
  ApiUpdateUserResult,
  ApiUserLoginRequest,
  ApiUserLoginResult,
} from './types';

export const apiUserLogin = ({ username, password }: ApiUserLoginRequest) =>
  api
    .post<ApiUserLoginResult>(API.USER.LOGIN, { username, password })
    .then(unwrap);

export const apiAuthGetUser = () =>
  api.get<ApiAuthGetUserResult>(API.USER.ME).then(unwrap);

export const apiAuthGetUserProfile = ({
  username,
}: ApiAuthGetUserProfileRequest) =>
  api.get<ApiAuthGetUserProfileResult>(API.USER.PROFILE(username)).then(unwrap);

export const apiAuthGetUpdates = ({
  exclude_dialogs,
  last,
}: ApiAuthGetUpdatesRequest) =>
  api
    .get<ApiAuthGetUpdatesResult>(API.USER.GET_UPDATES, {
      params: { exclude_dialogs, last },
    })
    .then(unwrap);

export const apiUpdateUser = ({ user }: ApiUpdateUserRequest) =>
  api.patch<ApiUpdateUserResult>(API.USER.ME, user).then(unwrap);

export const apiUpdatePhoto = ({ file }: ApiUpdatePhotoRequest) =>
  api.post<ApiUpdateUserResult>(API.USER.UPDATE_PHOTO, file).then(unwrap);

export const apiUpdateCover = ({ file }: ApiUpdatePhotoRequest) =>
  api.post<ApiUpdateUserResult>(API.USER.UPDATE_COVER, file).then(unwrap);

export const apiRequestRestoreCode = (field: string) =>
  api.post<{ field: string }>(API.USER.REQUEST_CODE(), { field }).then(unwrap);

export const apiCheckRestoreCode = ({ code }: ApiCheckRestoreCodeRequest) =>
  api.get<ApiCheckRestoreCodeResult>(API.USER.REQUEST_CODE(code)).then(unwrap);

export const apiRestoreCode = ({ code, password }: ApiRestoreCodeRequest) =>
  api
    .put<ApiRestoreCodeResult>(API.USER.REQUEST_CODE(code), { password })
    .then(unwrap);

export const apiGetSocials = () =>
  api.get<ApiGetSocialsResult>(API.USER.GET_SOCIALS).then(unwrap);

export const apiDropSocial = ({ id, provider }: ApiDropSocialRequest) =>
  api
    .delete<ApiDropSocialResult>(API.USER.DROP_SOCIAL(provider, id))
    .then(unwrap);

export const apiAttachSocial = ({ token }: ApiAttachSocialRequest) =>
  api
    .post<ApiAttachSocialResult>(API.USER.ATTACH_SOCIAL, { token })
    .then(unwrap);

export const apiLoginWithSocial = ({
  token,
  username,
  password,
}: ApiLoginWithSocialRequest) =>
  api
    .put<ApiLoginWithSocialResult>(API.USER.LOGIN_WITH_SOCIAL, {
      token,
      username,
      password,
    })
    .then(unwrap);

export const apiAttachTelegram = (data: TelegramUser) =>
  api.post(API.USER.ATTACH_TELEGRAM, data);
