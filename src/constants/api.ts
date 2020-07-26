import { INode, IComment } from '~/redux/types';

export const API = {
  BASE: process.env.API_HOST,
  USER: {
    LOGIN: '/user/login',
    VKONTAKTE_LOGIN: `${process.env.API_HOST}/oauth/vkontakte/redirect/login`,
    ME: '/user/',
    PROFILE: (username: string) => `/user/user/${username}/profile`,
    MESSAGES: (username: string) => `/user/user/${username}/messages`,
    MESSAGE_SEND: (username: string) => `/user/user/${username}/messages`,
    GET_UPDATES: '/user/updates',
    REQUEST_CODE: (code?: string) => `/user/restore/${code || ''}`,
    UPLOAD: (target, type) => `/upload/${target}/${type}`,
    GET_SOCIALS: '/oauth/',
    DROP_SOCIAL: (provider, id) => `/oauth/${provider}/${id}`,
  },
  NODE: {
    SAVE: '/node/',
    GET: '/node/',
    GET_DIFF: '/flow/diff',
    GET_NODE: (id: number | string) => `/node/${id}`,

    COMMENT: (id: INode['id']) => `/node/${id}/comment`,
    RELATED: (id: INode['id']) => `/node/${id}/related`,
    UPDATE_TAGS: (id: INode['id']) => `/node/${id}/tags`,
    POST_LIKE: (id: INode['id']) => `/node/${id}/like`,
    POST_STAR: (id: INode['id']) => `/node/${id}/heroic`,
    POST_LOCK: (id: INode['id']) => `/node/${id}/lock`,
    POST_LOCK_COMMENT: (id: INode['id'], comment_id: IComment['id']) =>
      `/node/${id}/comment/${comment_id}/lock`,
    SET_CELL_VIEW: (id: INode['id']) => `/node/${id}/cell-view`,
  },
  SEARCH: {
    NODES: '/search/nodes',
  },
  EMBED: {
    YOUTUBE: '/meta/youtube',
  },
  BORIS: {
    GET_BACKEND_STATS: '/stats/',
  },
};
