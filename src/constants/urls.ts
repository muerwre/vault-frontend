export const URLS = {
  BASE: '/',
  AUTH: {
    LOGIN: '/auth/login',
  },
  EXAMPLES: {
    EDITOR: '/examples/edit',
    IMAGE: '/examples/image',
  },
  NODE_URL: (id: number | string) => `/post${id}`,
};

export const PRESETS = {
  '1400': '1400',
  '900': '900',
  '600': '600',
  '300': '300',
  '100': '100',
  placeholder: 'placeholder',
  cover: 'cover',
  hero: 'hero',
  avatar: 'avatar',
};
