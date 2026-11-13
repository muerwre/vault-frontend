import type { IFile } from './file';
import type { IUser } from './user';

/** Wire shape of a comment. Mirrors the frontend's `IComment`. */
export interface IComment {
  id: number;
  text: string;
  files: IFile[];
  user?: Partial<IUser>;

  /** Computed per-request from `comment_user_likes`. */
  like_count?: number;
  /** Computed per request. The key is `liked`, not `is_liked`. */
  liked?: boolean;

  created_at?: string;
  /** Spelled `update_at`, without the 'd'. */
  update_at?: string;
  deleted_at?: string;
}

/**
 * Wire shape of a private message — a comment-like object with `from`/`to`
 * instead of `user`.
 */
export interface IMessage extends Omit<IComment, 'user'> {
  from: Partial<IUser>;
  to: Partial<IUser>;
}

/**
 * A note is a self-message (`fromId === toId`); there is no `note` table.
 * `content` maps onto `message.text`.
 */
export interface INote {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
}

/** Notes list envelope. The key is `totalCount`, not `totalItems`. */
export interface INotesList {
  list: INote[];
  totalCount: number;
}
