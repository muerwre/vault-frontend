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

/** The player of an embed: our copy when there is one, YouTube's otherwise. */
export const YoutubeEmbedFrame = ({ id, title, video, className }: Props) => (
  <div className={classNames(styles.wrap, className)}>
    <YoutubePlayer id={id} title={title} video={video} autoplay />
  </div>
);
