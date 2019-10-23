import { INode } from '~/redux/types';

export const API = {
  BASE: process.env.API_HOST,
  USER: {
    LOGIN: '/auth/login',
    ME: '/auth/', //
    UPLOAD: (target, type) => `/upload/${target}/${type}`,
  },
  NODE: {
    SAVE: '/node/',
    GET: '/node/',
    GET_NODE: (id: number | string) => `/node/${id}`,

    COMMENT: (id: INode['id']) => `/node/${id}/comment`,
    UPDATE_TAGS: (id: INode['id']) => `/node/${id}/tags`,
    POST_LIKE: (id: INode['id']) => `/node/${id}/like`,
    POST_STAR: (id: INode['id']) => `/node/${id}/heroic`,
    SET_CELL_VIEW: (id: INode['id']) => `/node/${id}/cell-view`,
  },
};
