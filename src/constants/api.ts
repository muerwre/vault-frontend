import { IComment, INode, ITag } from '~/types';
import { OAuthProvider } from '~/types/auth';
import { CONFIG } from '~/utils/config';

export const API = {
  BASE: CONFIG.apiHost,
  USER: {
    LOGIN: '/user/login',
    OAUTH_WINDOW: (provider: OAuthProvider) => `${CONFIG.apiHost}oauth/${provider}/redirect`,
    ME: '/user/',
    PROFILE: (username: string) => `/user/user/${username}/profile`,
    MESSAGES: (username: string) => `/user/user/${username}/messages`,
    MESSAGE_SEND: (username: string) => `/user/user/${username}/messages`,
    MESSAGE_DELETE: (username: string, id: number) => `/user/user/${username}/messages/${id}`,
    GET_UPDATES: '/user/updates',
    REQUEST_CODE: (code?: string) => `/user/restore/${code || ''}`,
    UPLOAD: (target, type) => `/upload/${target}/${type}`,

    GET_SOCIALS: '/oauth/',
    DROP_SOCIAL: (provider, id) => `/oauth/${provider}/${id}`,
    ATTACH_SOCIAL: `/oauth/attach`,
    LOGIN_WITH_SOCIAL: `/oauth/login`,
  },
  NODE: {
    SAVE: '/node/',
    GET: '/node/',
    GET_DIFF: '/flow/diff',
    GET_NODE: (id: number | string) => `/node/${id}`,

    COMMENT: (id: INode['id'] | string) => `/node/${id}/comment`,
    RELATED: (id: INode['id']) => `/node/${id}/related`,
    UPDATE_TAGS: (id: INode['id']) => `/node/${id}/tags`,
    DELETE_TAG: (id: INode['id'], tagId: ITag['ID']) => `/node/${id}/tags/${tagId}`,
    POST_LIKE: (id: INode['id']) => `/node/${id}/like`,
    POST_HEROIC: (id: INode['id']) => `/node/${id}/heroic`,
    POST_LOCK: (id: INode['id']) => `/node/${id}/lock`,
    LOCK_COMMENT: (id: INode['id'], comment_id: IComment['id']) =>
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
    GITHUB_ISSUES: 'https://api.github.com/repos/muerwre/vault-frontend/issues',
  },
  TAG: {
    NODES: `/tag/nodes`,
    AUTOCOMPLETE: `/tag/autocomplete`,
  },
  LAB: {
    NODES: `/lab/`,
    STATS: '/lab/stats',
    UPDATES: '/lab/updates',
  },
};
