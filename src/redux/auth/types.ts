import { IFile, IMessage, INotification } from '../types';

export interface IToken {
  access: string;
  refresh: string;
}

export interface IUser {
  id: number;
  username: string;
  email: string;
  role: string;
  photo: IFile;
  cover: IFile;
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
    is_loading_messages: boolean;
    is_sending_messages: boolean;

    user: IUser;
    messages: IMessage[];
    messages_error: string;
    patch_errors: Record<string, string>;

    socials: {
      accounts: ISocialAccount[];
      error: string;
      is_loading: boolean;
    };
  };

  restore: {
    code: string;
    user: Pick<IUser, 'username' | 'photo'>;
    is_loading: boolean;
    is_succesfull: boolean;
    error: string;
  };
}>;
