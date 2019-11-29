import { INode } from '~/redux/types';

export const API = {
  BASE: process.env.API_HOST,
  USER: {
    LOGIN: '/user/login',
    VKONTAKTE_LOGIN: `${process.env.API_HOST}/user/vkontakte`,
    ME: '/user/',
    PROFILE: (username: string) => `/user/${username}/profile`,
    MESSAGES: (username: string) => `/user/${username}/messages`,
    MESSAGE_SEND: (username: string) => `/user/${username}/messages`,
    GET_UPDATES: '/user/updates',
    REQUEST_CODE: (code?: string) => `/user/restore/${code || ''}`,

    UPLOAD: (target, type) => `/upload/${target}/${type}`,
  },
  NODE: {
    SAVE: '/node/',
    GET: '/node/',
    GET_DIFF: '/node/diff',
    GET_NODE: (id: number | string) => `/node/${id}`,

    COMMENT: (id: INode['id']) => `/node/${id}/comment`,
    RELATED: (id: INode['id']) => `/node/${id}/related`,
    UPDATE_TAGS: (id: INode['id']) => `/node/${id}/tags`,
    POST_LIKE: (id: INode['id']) => `/node/${id}/like`,
    POST_STAR: (id: INode['id']) => `/node/${id}/heroic`,
    POST_LOCK: (id: INode['id']) => `/node/${id}/lock`,
    SET_CELL_VIEW: (id: INode['id']) => `/node/${id}/cell-view`,
  },
};
