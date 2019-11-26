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
  NODE_URL: (id: number | string) => `/post${id}`,
  PROFILE: (username: string) => `/~${username}`,
};

export const PRESETS = {
  '1600': '1600',
  '900': '900',
  '600': '600',
  '300': '300',
  '100': '100',
  placeholder: 'placeholder',
  cover: 'cover',
  hero: 'hero',
  small_hero: 'small_hero',
  avatar: 'avatar',
};
