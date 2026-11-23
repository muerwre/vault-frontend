import type { OAuthProvider } from '../constants/oauth';
import type { ProfileNodesView, Role } from '../constants/user';

import type { IFile } from './file';

/** Wire shape of a user. Mirrors the frontend's `IUser`. */
export interface IUser {
  id: number;
  username: string;
  role: Role;
  fullname: string;
  description: string;
  photo?: IFile;
  cover?: IFile;

  /** Never serialise the password; email is hidden on public profiles. */
  email?: string;

  is_activated: boolean;

  last_seen: string;
  last_seen_messages: string;
  /** Derived server-side; there is no such column. */
  last_seen_boris: string;
}

/**
 * `user_profile.settings`. Every key is optional; absent means the default.
 * Never trust the stored shape: it is read leniently.
 */
export interface IUserProfileSettings {
  /** External links, absolute http(s) URLs. */
  links?: string[];
  /** The owner's choice of how visitors first see the profile's nodes. */
  nodes_view?: ProfileNodesView;
}

/** Compact user embedded in lists. */
export interface IShallowUser {
  id: number;
  username: string;
  photo?: IFile;
}

/** A linked OAuth account, as returned by the OAuth list endpoint. */
export interface ISocialAccount {
  provider: OAuthProvider;
  /** ← `social.account_id` */
  id: string;
  /** ← `social.account_name` */
  name: string;
  /** ← `social.account_photo` */
  photo: string;
}

/** JWT payload. HS256 with **no `exp`**; issued tokens never expire. */
export interface ITokenClaims {
  /** user id */
  uid: number;
  /** username */
  nme: string;
  /** role */
  rol: Role;
  /** issued at (seconds) */
  iat: number;
}
