export const COMMENT_BLOCK_TYPES = {
  TEXT: 'TEXT',
  MARK: 'MARK',
  EMBED: 'EMBED',
};

export const COMMENT_BLOCK_DETECTORS = [
  {
    type: COMMENT_BLOCK_TYPES.EMBED,
    test: /(https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch)?(\?v=)?[\w\-&=]+)/gim,
  },
  {
    type: COMMENT_BLOCK_TYPES.MARK,
    test: /^[\n\s]{0,}?&lt;\.{3}&gt;[\n\s]{0,}$/gi,
  },
  {
    type: COMMENT_BLOCK_TYPES.TEXT,
    test: /^.*$/gi,
  },
];

export type ICommentBlock = {
  type: (typeof COMMENT_BLOCK_TYPES)[keyof typeof COMMENT_BLOCK_TYPES];
  content: string;
};

export type ICommentBlockProps = {
  block: ICommentBlock;
};

export const NEW_COMMENT_CLASSNAME = 'newComment';
