import { INode } from '~/redux/types';

export const API = {
  BASE: process.env.API_HOST,
  USER: {
    LOGIN: '/auth/login',
    VKONTAKTE_LOGIN: `${process.env.API_HOST}/auth/vkontakte`,
    ME: '/auth/',
    UPLOAD: (target, type) => `/upload/${target}/${type}`,
    PROFILE: (username: string) => `/auth/user/${username}`,
  },
  NODE: {
    SAVE: '/node/',
    GET: '/node/',
    GET_NODE: (id: number | string) => `/node/${id}`,

    COMMENT: (id: INode['id']) => `/node/${id}/comment`,
    RELATED: (id: INode['id']) => `/node/${id}/related`,
    UPDATE_TAGS: (id: INode['id']) => `/node/${id}/tags`,
    POST_LIKE: (id: INode['id']) => `/node/${id}/like`,
    POST_STAR: (id: INode['id']) => `/node/${id}/heroic`,
    SET_CELL_VIEW: (id: INode['id']) => `/node/${id}/cell-view`,
  },
};
