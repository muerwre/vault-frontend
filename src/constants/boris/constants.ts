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
