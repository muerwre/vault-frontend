import { FlowDisplayVariant, INode } from '~/types';

export const URLS = {
  BASE: '/',
  LAB: '/lab',
  ROOM: '/room',
  BORIS: '/boris',
  AUTH: {
    LOGIN: '/auth/login',
  },
  EXAMPLES: {
    EDITOR: '/examples/edit',
    IMAGE: '/examples/image',
  },
  NODE_URL: (id: INode['id'] | string) => `/post${id}`,
  PROFILE_PAGE: (username: string) => `/profile/${username}`,
  SETTINGS: {
    BASE: '/settings',
    NOTES: '/settings/notes',
    TRASH: '/settings/trash',
  },
  NOTES: '/notes/',
  NOTE: (id: number) => `/notes/${id}`,
};

export const imagePresets = {
  '1600': '1600',
  '900': '900',
  '1200': '1200',
  '600': '600',
  '300': '300',
  cover: 'cover',
  small_hero: 'small_hero',
  avatar: 'avatar',
  flow_square: 'flow_square',
  flow_vertical: 'flow_vertical',
  flow_horizontal: 'flow_horizontal',
} as const;

export type ImagePreset = (typeof imagePresets)[keyof typeof imagePresets];

export const imageSrcSets: Partial<Record<ImagePreset, number>> = {
  [imagePresets[1600]]: 1600,
  [imagePresets[900]]: 900,
  [imagePresets[1200]]: 1200,
  [imagePresets[600]]: 600,
  [imagePresets[300]]: 300,
};

export const flowDisplayToPreset: Record<
  FlowDisplayVariant,
  (typeof imagePresets)[keyof typeof imagePresets]
> = {
  single: 'flow_square',
  quadro: 'flow_square',
  vertical: 'flow_vertical',
  horizontal: 'flow_horizontal',
};
