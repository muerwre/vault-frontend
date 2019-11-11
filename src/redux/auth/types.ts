import { IFile } from '../types';

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

  is_activated: boolean;
  is_user: boolean;
}

export type IAuthState = Readonly<{
  user: IUser;
  token: string;

  login: {
    error: string;
    is_loading: boolean;
  };

  profile: {
    is_loading: boolean;
    user: IUser;
  };
}>;
