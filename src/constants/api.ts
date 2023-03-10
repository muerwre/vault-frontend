import { IComment, INode, ITag } from '~/types';
import { OAuthProvider } from '~/types/auth';
import { CONFIG } from '~/utils/config';

export const API = {
  BASE: CONFIG.apiHost,
  USER: {
    LOGIN: '/auth',
    OAUTH_WINDOW: (provider: OAuthProvider) =>
      `${CONFIG.apiHost}oauth/${provider}/redirect`,
    ME: '/auth',
    UPDATE_PHOTO: '/auth/photo',
    UPDATE_COVER: '/auth/photo',
    PROFILE: (username: string) => `/users/${username}/profile`,
    MESSAGES: (username: string) => `/users/${username}/messages`,
    MESSAGE_SEND: (username: string) => `/users/${username}/messages`,
    MESSAGE_DELETE: (username: string, id: number) =>
      `/users/${username}/messages/${id}`,
    GET_UPDATES: '/auth/updates',
    REQUEST_CODE: (code?: string) => `/auth/restore/${code || ''}`,
    UPLOAD: (target, type) => `/upload/${target}/${type}`,

    GET_SOCIALS: '/oauth',
    DROP_SOCIAL: (provider, id) => `/oauth/${provider}/${id}`,
    ATTACH_SOCIAL: `/oauth`,
    LOGIN_WITH_SOCIAL: `/oauth`,
  },
  NODES: {
    SAVE: '/nodes/',
    LIST: '/nodes/',
    GET: (id: number | string) => `/nodes/${id}`,
    DELETE: (id: INode['id']) => `/nodes/${id}`,
    LIKE: (id: INode['id']) => `/nodes/${id}/like`,
    HEROIC: (id: INode['id']) => `/nodes/${id}/heroic`,
    SET_CELL_VIEW: (id: INode['id']) => `/nodes/${id}/cell-view`,
    RELATED: (id: INode['id']) => `/nodes/${id}/related`,

    UPDATE_TAGS: (id: INode['id']) => `/nodes/${id}/tags`,
    DELETE_TAG: (id: INode['id'], tagId: ITag['ID']) =>
      `/nodes/${id}/tags/${tagId}`,

    COMMENT: (id: INode['id'] | string) => `/nodes/${id}/comments`,
    LOCK_COMMENT: (id: INode['id'], comment_id: IComment['id']) =>
      `/nodes/${id}/comments/${comment_id}`,
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
  NOTIFICATIONS: {
    LIST: '/notifications/',
    SETTINGS: '/notifications/settings',
  },
};
