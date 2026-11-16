import { FC } from 'react';

import type { IEmbedVideo } from '@vault/common/types';
import classNames from 'classnames';

import styles from './styles.module.scss';

interface Props {
  video?: IEmbedVideo;
  className?: string;
}

/** How saving our copy of a video is going, while there is anything to say. */
const VideoSaveBadge: FC<Props> = ({ video, className }) => {
  let text = '';

  if (video?.status === 'queued') {
    text = 'сохраняется';
  } else if (video?.status === 'downloading') {
    text = `сохраняется · ${video.progress ?? 0} %`;
  } else if (video?.status === 'failed') {
    text = 'не удалось сохранить';
  }

  return text ? (
    <span className={classNames(styles.badge, className)}>{text}</span>
  ) : null;
};

export { VideoSaveBadge };
