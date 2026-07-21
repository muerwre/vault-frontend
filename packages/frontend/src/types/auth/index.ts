import { Role } from '~/constants/auth';
import { IFile } from '~/types';

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

export type OAuthProvider = 'vkontakte' | 'google' | 'telegram';

export interface ISocialAccount {
  provider: OAuthProvider;
  id: string;
  name: string;
  photo: string;
}

export interface ShallowUser {
  id: number;
  username: string;
  photo: string;
}
