export const API = {
  BASE: process.env.API_HOST,
  USER: {
    LOGIN: '/auth/login',
    ME: '/auth/me', //
    UPLOAD: (target, type) => `/upload/${target}/${type}`,
  },
  NODE: {
    SAVE: '/node/',
    GET: '/node/',
  },
};
