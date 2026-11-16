import { parseMediaUrl, YOUTUBE_PROVIDER } from '@vault/common/media';

export const COMMENT_BLOCK_TYPES = {
  TEXT: 'TEXT',
  MARK: 'MARK',
  EMBED: 'EMBED',
};

/** A line that is nothing but a link to a video. */
const MEDIA_LINK_LINE = new RegExp(
  `^\\s*${YOUTUBE_PROVIDER.urlInText.source}\\s*$`,
  'i',
);

export const isMediaLinkLine = (line: string): boolean =>
  MEDIA_LINK_LINE.test(line) && !!parseMediaUrl(line.trim());

export const COMMENT_BLOCK_DETECTORS: Array<{
  type: string;
  test: RegExp | ((line: string) => boolean);
}> = [
  {
    type: COMMENT_BLOCK_TYPES.EMBED,
    test: isMediaLinkLine,
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
