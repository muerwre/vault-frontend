import { FC } from 'react';

import { YoutubeEmbed } from '~/components/media/YoutubeEmbed';
import { ICommentBlockProps } from '~/constants/comment';

/** A comment line that is a video link, shown as the video. */
const CommentEmbedBlock: FC<ICommentBlockProps> = ({ block }) => (
  <YoutubeEmbed url={block.content} />
);

export { CommentEmbedBlock };
