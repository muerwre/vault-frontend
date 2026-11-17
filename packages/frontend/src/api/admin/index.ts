import {
  ApiMediaJobList,
  ApiMediaSummary,
  MediaJobFilter,
} from '~/api/admin/types';
import { API } from '~/constants/api';
import { IUser } from '~/types/auth';
import { api, unwrap } from '~/utils/api';

export const apiGetMediaSummary = () =>
  api.get<ApiMediaSummary>(API.ADMIN.MEDIA_SUMMARY).then(unwrap);

export const apiGetMediaJobs = (status: MediaJobFilter, take = 50) =>
  api
    .get<ApiMediaJobList>(API.ADMIN.MEDIA_JOBS, { params: { status, take } })
    .then(unwrap);

export const apiRetryMediaJob = (id: number) =>
  api.post(API.ADMIN.MEDIA_JOB_RETRY(id)).then(unwrap);

export const apiGetAdminUsers = () =>
  api.get<{ users: IUser[] }>(API.ADMIN.USERS).then(unwrap);
