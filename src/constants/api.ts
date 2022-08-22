import { IComment, INode, ITag } from '~/types';
import { OAuthProvider } from '~/types/auth';
import { CONFIG } from '~/utils/config';

export const API = {
  BASE: CONFIG.apiHost,
  USER: {
    LOGIN: '/users/login',
    OAUTH_WINDOW: (provider: OAuthProvider) =>
      `${CONFIG.apiHost}oauth/${provider}/redirect`,
    ME: '/users/',
    PROFILE: (username: string) => `/users/user/${username}/profile`,
    MESSAGES: (username: string) => `/users/user/${username}/messages`,
    MESSAGE_SEND: (username: string) => `/users/user/${username}/messages`,
    MESSAGE_DELETE: (username: string, id: number) =>
      `/users/user/${username}/messages/${id}`,
    GET_UPDATES: '/users/updates',
    REQUEST_CODE: (code?: string) => `/users/restore/${code || ''}`,
    UPLOAD: (target, type) => `/upload/${target}/${type}`,

    GET_SOCIALS: '/oauth/',
    DROP_SOCIAL: (provider, id) => `/oauth/${provider}/${id}`,
    ATTACH_SOCIAL: `/oauth/attach`,
    LOGIN_WITH_SOCIAL: `/oauth/login`,
  },
  NODE: {
    SAVE: '/nodes/',
    GET_DIFF: '/nodes/',
    GET_NODE: (id: number | string) => `/nodes/${id}`,

    RELATED: (id: INode['id']) => `/nodes/${id}/related`,
    UPDATE_TAGS: (id: INode['id']) => `/nodes/${id}/tags`,
    DELETE_TAG: (id: INode['id'], tagId: ITag['ID']) =>
      `/nodes/${id}/tags/${tagId}`,
    POST_LIKE: (id: INode['id']) => `/nodes/${id}/like`,
    POST_HEROIC: (id: INode['id']) => `/nodes/${id}/heroic`,
    POST_LOCK: (id: INode['id']) => `/nodes/${id}/lock`,
    SET_CELL_VIEW: (id: INode['id']) => `/nodes/${id}/cell-view`,

    COMMENT: (id: INode['id'] | string) => `/nodes/${id}/comment`,
    LOCK_COMMENT: (id: INode['id'], comment_id: IComment['id']) =>
      `/nodes/${id}/comment/${comment_id}`,
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
    NODES: `/tags/nodes`,
    AUTOCOMPLETE: `/tags/autocomplete`,
  },
  LAB: {
    NODES: `/nodes/lab`,
    STATS: '/nodes/lab/stats',
    UPDATES: '/nodes/lab/updates',
  },
};
