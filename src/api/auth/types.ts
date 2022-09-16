import { IFile, INotification } from '~/types';
import { ISocialAccount, IUser } from '~/types/auth';

export type ApiUserLoginRequest = Record<'username' | 'password', string>;
export type ApiUserLoginResult = { token: string; user: IUser };
export type ApiAuthGetUserRequest = {};
export type ApiAuthGetUserResult = { user: IUser };
export type ApiUpdateUserRequest = {
  user: Partial<IUser & { password: string; newPassword: string }>;
};
export type ApiUpdatePhotoRequest = {
  file: IFile;
};
export type ApiUpdateUserResult = {
  user: IUser;
  errors: Record<Partial<keyof IUser>, string>;
};
export type ApiAuthGetUserProfileRequest = { username: string };
export type ApiAuthGetUserProfileResult = { user: IUser };
export type ApiAuthGetUpdatesRequest = {
  exclude_dialogs: number;
  last: string;
};
export type ApiAuthGetUpdatesResult = {
  notifications: INotification[];
  boris: { commented_at: string };
};
export type ApiCheckRestoreCodeRequest = { code: string };
export type ApiCheckRestoreCodeResult = { user: IUser };
export type ApiRestoreCodeRequest = { code: string; password: string };
export type ApiRestoreCodeResult = { token: string; user: IUser };
export type ApiGetSocialsResult = { accounts: ISocialAccount[] };
export type ApiDropSocialRequest = { id: string; provider: string };
export type ApiDropSocialResult = {};
export type ApiAttachSocialRequest = { token: string };
export type ApiAttachSocialResult = { account: ISocialAccount };
export type ApiLoginWithSocialRequest = {
  token: string;
  username?: string;
  password?: string;
};
export type ApiLoginWithSocialResult = {
  token: string;
  errors: Record<string, string>;
  needs_register: boolean;
};
