import { COMMENT_BLOCK_TYPES } from '~/constants/comment';

import { CommentEmbedBlock } from '../components/CommentEmbedBlock';
import { CommentTextBlock } from '../components/CommentTextBlock';

export const COMMENT_BLOCK_RENDERERS = {
  [COMMENT_BLOCK_TYPES.TEXT]: CommentTextBlock,
  [COMMENT_BLOCK_TYPES.MARK]: CommentTextBlock,
  [COMMENT_BLOCK_TYPES.EMBED]: CommentEmbedBlock,
};
