import { StatBackend } from '~/types/boris';

export const initialBackendStats: StatBackend = {
  users: {
    total: 0,
    alive: 0,
  },
  nodes: {
    images: 0,
    audios: 0,
    videos: 0,
    texts: 0,
    total: 0,
    by_month: [],
  },
  comments: {
    total: 0,
    by_month: [],
  },
  files: {
    count: 0,
    size: 0,
  },
};

export const foundationDate = '2009-07-21 12:28:58';

export const ANNOUNCE_USER_ID = 1;
export const BORIS_NODE_ID = 696;
