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

  is_activated: boolean;
  is_user: boolean;
}

export type IAuthState = Readonly<{
  user: IUser;
  token: string;

  updates: {
    last: string;
    notifications: INotification[];
  };

  login: {
    error: string;
    is_loading: boolean;
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
  };

  restore: {
    code: string;
    user: Pick<IUser, 'username' | 'photo'>;
    is_loading: boolean;
    is_succesfull: boolean;
    errors: Record<string, string>;
  };
}>;
