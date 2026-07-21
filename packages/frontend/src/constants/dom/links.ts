export const NEW_COMMENT_ANCHOR_NAME = 'new-comment';
export const COMMENT_ANCHOR_PREFIX = 'comment';

export const getCommentId = (id: number) =>
  [COMMENT_ANCHOR_PREFIX, id].join('-');

export const getNewCommentAnchor = (url: string) =>
  [url, NEW_COMMENT_ANCHOR_NAME].join('#');

export const getCommentAnchor = (url: string, commentId: number) =>
  [url, getCommentId(commentId)].join('#');

export const isCommentAnchor = (hash: string | undefined) =>
  hash?.startsWith(COMMENT_ANCHOR_PREFIX) ||
  hash?.startsWith(NEW_COMMENT_ANCHOR_NAME);
