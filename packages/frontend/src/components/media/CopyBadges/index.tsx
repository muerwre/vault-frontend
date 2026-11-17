import { FC, MouseEvent } from 'react';

import { YOUTUBE_PROVIDER } from '@vault/common/media';
import type { IEmbedVideo } from '@vault/common/types';
import classNames from 'classnames';

import { getURLFromString } from '~/utils/dom';

import styles from './styles.module.scss';

interface Props {
  /** YouTube video id. */
  id: string;
  /** Our copy, as the metadata endpoint reports it. */
  video?: IEmbedVideo;
  className?: string;
}

const megabytes = (bytes: number) =>
  `${Math.max(1, Math.round(bytes / 1024 / 1024))} MB`;

/** Badges sit over covers that start playback; using one must not. */
const keepToItself = (event: MouseEvent) => event.stopPropagation();

/**
 * A stored copy's download link, with its quality and size, and a link to the
 * original on YouTube. Shown only for videos we have a copy of.
 */
const CopyBadges: FC<Props> = ({ id, video, className }) => {
  if (video?.status !== 'ready' || !video.url) {
    return null;
  }

  const details = [
    video.height ? `${video.height}p` : '',
    video.size ? `(${megabytes(video.size)})` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames(styles.badges, className)}>
      <a
        className={styles.badge}
        href={getURLFromString(video.url)}
        download={`${id}.mp4`}
        title="Скачать сохранённую копию"
        onClick={keepToItself}
      >
        {/* drawn, not font glyphs: fonts render arrows inconsistently */}
        <svg className={styles.icon} viewBox="0 0 10 10" aria-hidden="true">
          <path d="M5 1v7M2 5.2 5 8.2l3-3M1.5 9.5h7" />
        </svg>
        {details || 'MP4'}
      </a>

      <a
        className={styles.badge}
        href={YOUTUBE_PROVIDER.canonicalUrl(id)}
        target="_blank"
        rel="noreferrer"
        title="Оригинал на YouTube"
        onClick={keepToItself}
      >
        YouTube
        <svg className={styles.icon} viewBox="0 0 10 10" aria-hidden="true">
          <path d="M3 1h6v6M9 1 1.5 8.5" />
        </svg>
      </a>
    </div>
  );
};

export { CopyBadges };
