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

export const apiGetMediaJobs = (
  status: MediaJobFilter,
  take: number,
  skip: number,
) =>
  api
    .get<ApiMediaJobList>(API.ADMIN.MEDIA_JOBS, {
      params: { status, take, skip },
    })
    .then(unwrap);

export const apiRetryMediaJob = (id: number) =>
  api.post(API.ADMIN.MEDIA_JOB_RETRY(id)).then(unwrap);

/** Releases a backlog item now; `id` is the item's. */
export const apiReleaseMediaItem = (id: number) =>
  api.post(API.ADMIN.MEDIA_ITEM_RELEASE(id)).then(unwrap);

/** Stops keeping an item's video; `id` is the item's. */
export const apiSkipMediaItem = (id: number) =>
  api.post(API.ADMIN.MEDIA_ITEM_SKIP(id)).then(unwrap);

/** Queues a skipped item's video again; `id` is the item's. */
export const apiUnskipMediaItem = (id: number) =>
  api.post(API.ADMIN.MEDIA_ITEM_UNSKIP(id)).then(unwrap);

/** A user as the admin page lists them, with the accounts they sign in with. */
export interface ApiAdminUser extends IUser {
  accounts: Array<{ provider: string; account_id: string }>;
}

export const apiGetAdminUsers = () =>
  api.get<{ users: ApiAdminUser[] }>(API.ADMIN.USERS).then(unwrap);

/** Soft-deletes a user; their posts and comments stay. */
export const apiDeleteAdminUser = (id: number) =>
  api.delete(API.ADMIN.USER(id)).then(unwrap);
