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
