import type { IEmbedVideo } from '@vault/common/types';
import classNames from 'classnames';

import { YoutubePlayer } from '~/components/media/YoutubePlayer';

import styles from './styles.module.scss';

interface Props {
  id: string;
  title: string;
  video?: IEmbedVideo;
  className?: string;
}

/** The player in a comment: YouTube's, or our copy where YouTube cannot play it. */
export const CommentVideoFrame = ({ id, title, video, className }: Props) => (
  <div className={classNames(styles.wrap, className)}>
    <YoutubePlayer id={id} title={title} video={video} autoplay />
  </div>
);
