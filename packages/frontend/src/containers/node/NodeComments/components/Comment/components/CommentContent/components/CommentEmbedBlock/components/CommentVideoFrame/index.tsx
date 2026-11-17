import type { IEmbedVideo } from '@vault/common/types';
import classNames from 'classnames';

import { YoutubePlayer } from '~/components/media/YoutubePlayer';

import styles from './styles.module.scss';

interface Props {
  id: string;
  title: string;
  video?: IEmbedVideo;
  /** Whether it is still unknown if a copy exists. */
  pending?: boolean;
  className?: string;
}

/** The player in a comment: our copy when there is one, YouTube's otherwise. */
export const CommentVideoFrame = ({
  id,
  title,
  video,
  pending,
  className,
}: Props) => (
  <div className={classNames(styles.wrap, className)}>
    <YoutubePlayer
      id={id}
      title={title}
      video={video}
      pending={pending}
      autoplay
    />
  </div>
);
