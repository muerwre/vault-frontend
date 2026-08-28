/**
 * `GET /stats/` response. Mirrors the frontend's `StatBackend`
 * (`packages/frontend/src/types/boris`).
 */
export interface IBackendStats {
  users: {
    total: number;
    /** Seen within `USER_INACTIVITY_DAYS`. */
    alive: number;
  };
  nodes: {
    images: number;
    audios: number;
    videos: number;
    texts: number;
    total: number;
    by_month: number[];
  };
  comments: {
    total: number;
    by_month: number[];
  };
  files: {
    count: number;
    /** Sum of `file.size` in bytes. */
    size: number;
  };
}

/** `GET /nodes/lab/stats` response. */
export interface ILabStats {
  heroes: unknown[];
  tags: unknown[];
}
