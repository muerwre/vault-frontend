import { IUser } from '~/types/auth';

export enum Role {
  Guest = 'guest',
  User = 'user',
  Admin = 'admin',
}

export const EMPTY_USER: IUser = {
  id: 0,
  role: Role.Guest,
  email: '',
  name: '',
  username: '',
  photo: undefined,
  cover: undefined,
  is_activated: false,
  is_user: false,
  fullname: '',
  description: '',

  last_seen: '',
  last_seen_messages: '',
  last_seen_boris: '',
};
