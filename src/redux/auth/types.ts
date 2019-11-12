import { IFile, IMessage } from '../types';

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
  last_seen: string;
  fullname: string;
  description: string;

  is_activated: boolean;
  is_user: boolean;
}

export type IAuthState = Readonly<{
  user: IUser;
  token: string;

  updates: {
    messages: IMessage[];
  };

  login: {
    error: string;
    is_loading: boolean;
  };

  profile: {
    is_loading: boolean;
    is_loading_messages: boolean;
    is_sending_messages: boolean;

    user: IUser;
    messages: IMessage[];
    messages_error: string;
  };
}>;
