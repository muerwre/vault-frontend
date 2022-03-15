import { FlowDisplay, FlowDisplayVariant, INode } from '~/types';

export const URLS = {
  BASE: '/',
  LAB: '/lab',
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
  NODE_EDIT_URL: (id: INode['id'] | string) => `/post${id}/edit`,
  NODE_CREATE_URL: (type: string) => `/`,
  NODE_TAG_URL: (id: number, tagName: string) => `/post${id}/tag/${tagName}`,
  PROFILE: (username: string) => `/~${username}`,
  PROFILE_PAGE: (username: string) => `/profile/${username}`,
};

export const ImagePresets = {
  '1600': '1600',
  '600': '600',
  '300': '300',
  cover: 'cover',
  small_hero: 'small_hero',
  avatar: 'avatar',
  flow_square: 'flow_square',
  flow_vertical: 'flow_vertical',
  flow_horizontal: 'flow_horizontal',
} as const;

export const flowDisplayToPreset: Record<
  FlowDisplayVariant,
  typeof ImagePresets[keyof typeof ImagePresets]
> = {
  single: 'flow_square',
  quadro: 'flow_square',
  vertical: 'flow_vertical',
  horizontal: 'flow_horizontal',
};
