import { IFile, INotification, IResultWithStatus } from '../types';

export interface IToken {
  access: string;
  refresh: string;
}

export interface IUser {
  id: number;
  username: string;
  email: string;
  role: string;
  photo?: IFile;
  cover?: IFile;
  name: string;
  fullname: string;
  description: string;

  last_seen: string;
  last_seen_messages: string;
  last_seen_boris: string;

  is_activated: boolean;
  is_user: boolean;
}

export type ISocialProvider = 'vkontakte' | 'google';

export interface ISocialAccount {
  provider: ISocialProvider;
  id: string;
  name: string;
  photo: string;
}

export type IAuthState = Readonly<{
  user: IUser;
  token: string;

  updates: {
    last: string;
    notifications: INotification[];
    boris_commented_at: string;
  };

  login: {
    error: string;
    is_loading: boolean;
    is_registering: boolean;
  };

  profile: {
    tab: 'profile' | 'messages' | 'settings';
    is_loading: boolean;

    user?: IUser;
    patch_errors: Record<string, string>;

    socials: {
      accounts: ISocialAccount[];
      error: string;
      is_loading: boolean;
    };
  };

  restore: {
    code: string;
    user?: Pick<IUser, 'username' | 'photo'>;
    is_loading: boolean;
    is_succesfull: boolean;
    error: string;
  };

  register_social: {
    errors: {
      username: string;
      password: string;
    };
    error: string;
    token: string;
    is_loading: boolean;
  };
}>;

export type ApiWithTokenRequest = { access: string };

export type ApiUserLoginRequest = Record<'username' | 'password', string>;
export type ApiUserLoginResult = { token: string; user: IUser };

export type ApiAuthGetUserRequest = {};
export type ApiAuthGetUserResult = { user: IUser };

export type ApiUpdateUserRequest = { user: Partial<IUser> };
export type ApiUpdateUserResult = { user: IUser; errors: Record<Partial<keyof IUser>, string> };

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
export type ApiDropSocialResult = { accounts: ISocialAccount[] };

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
