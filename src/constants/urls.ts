import { INode } from '~/redux/types';

export const URLS = {
  BASE: '/',
  BORIS: '/boris',
  AUTH: {
    LOGIN: '/auth/login',
  },
  EXAMPLES: {
    EDITOR: '/examples/edit',
    IMAGE: '/examples/image',
  },
  ERRORS: {
    NOT_FOUND: '/lost',
    BACKEND_DOWN: '/oopsie',
  },
  NODE_URL: (id: INode['id'] | string) => `/post${id}`,
  NODE_TAG_URL: (id: number, tagName: string) => `/post${id}/tag/${tagName}`,
  PROFILE: (username: string) => `/~${username}`,
  PROFILE_PAGE: (username: string) => `/profile/${username}`,
};

export const PRESETS = {
  '1600': '1600',
  '600': '600',
  '300': '300',
  cover: 'cover',
  small_hero: 'small_hero',
  avatar: 'avatar',
};
