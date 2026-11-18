import { API } from '~/constants/api';
import { api, unwrap } from '~/utils/api';

import {
  ApiCheckRegistrationCodeResult,
  ApiCompleteRegistrationRequest,
  ApiCompleteRegistrationResult,
  ApiFeatures,
  ApiRegistrationRequest,
  ApiRequestRegistrationRequest,
  ApiRequestRegistrationResult,
} from './types';

export const apiGetFeatures = () =>
  api.get<ApiFeatures>(API.FEATURES).then(unwrap);

export const apiRequestRegistration = ({
  email,
  reason,
}: ApiRequestRegistrationRequest) =>
  api
    .post<ApiRequestRegistrationResult>(API.REGISTRATION.REQUEST, {
      email,
      reason,
    })
    .then(unwrap);

export const apiCheckRegistrationCode = (code: string) =>
  api
    .get<ApiCheckRegistrationCodeResult>(API.REGISTRATION.CODE(code))
    .then(unwrap);

export const apiCompleteRegistration = ({
  code,
  username,
  password,
}: ApiCompleteRegistrationRequest) =>
  api
    .put<ApiCompleteRegistrationResult>(API.REGISTRATION.CODE(code), {
      username,
      password,
    })
    .then(unwrap);

export const apiGetRegistrationRequests = () =>
  api
    .get<{ requests: ApiRegistrationRequest[] }>(API.ADMIN.REGISTRATIONS)
    .then(unwrap);

export const apiRegistrationAction = (
  id: number,
  action: 'approve' | 'reject' | 'resend',
) =>
  api
    .post<{
      request: ApiRegistrationRequest;
    }>(API.ADMIN.REGISTRATION_ACTION(id, action))
    .then(unwrap);
