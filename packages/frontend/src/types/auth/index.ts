import type { ProfileNodesView } from '@vault/common/constants';

import { Role } from '~/constants/auth';
import { FlowDisplayVariant, IFile } from '~/types';

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
  /** Long-form markdown for the big card on the profile page. */
  about?: string;
  /** Size of the about card; empty means the page default. */
  about_display?: FlowDisplayVariant | '';
  /** External links shown on the profile page. */
  links?: string[];
  /** How visitors first see the profile's nodes; the owner's choice. */
  nodes_view?: ProfileNodesView;

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
