import { IFile } from '~/types';
import { Role } from '~/constants/auth';

export interface IUser {
  id: number;
  username: string;
  email: string;
  role: Role;
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

export type OAuthProvider = 'vkontakte' | 'google';

export interface ISocialAccount {
  provider: OAuthProvider;
  id: string;
  name: string;
  photo: string;
}
