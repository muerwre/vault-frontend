import { FC, useEffect, useRef, useState } from 'react';

import { YOUTUBE_PROVIDER } from '@vault/common/media';
import type { IEmbedVideo } from '@vault/common/types';
import classNames from 'classnames';

import { CopyBadges } from '~/components/media/CopyBadges';
import { getURLFromString, getYoutubeThumbById } from '~/utils/dom';

import styles from './styles.module.scss';

const YOUTUBE_ORIGIN = 'https://www.youtube.com';

/**
 * Embed errors meaning the video will not play here: removed or private (100),
 * or embedding disabled by its owner (101, 150).
 */
const UNPLAYABLE = [100, 101, 150];

interface Props {
  id: string;
  title?: string;
  autoplay?: boolean;
  /** Our copy, as the metadata endpoint reports it. */
  video?: IEmbedVideo;
  className?: string;
}

/**
 * A YouTube video. Our copy plays whenever one is known, since YouTube is not
 * reachable everywhere; YouTube's own player otherwise, at once. If a copy
 * becomes known after playback started, the player switches to it.
 */
const YoutubePlayer: FC<Props> = ({
  id,
  title,
  autoplay,
  video,
  className,
}) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const [embedFailed, setEmbedFailed] = useState(false);
  // The embed reports errors over postMessage once asked to.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) {
        return;
      }

      try {
        const data =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (
          data?.event === 'onError' &&
          UNPLAYABLE.includes(Number(data.info))
        ) {
          setEmbedFailed(true);
        }
      } catch {
        // not one of the player's messages
      }
    };

    window.addEventListener('message', onMessage);

    return () => window.removeEventListener('message', onMessage);
  }, []);

  const listen = () => {
    const target = frame.current?.contentWindow;

    for (const message of [
      { event: 'listening', id: 1, channel: 'widget' },
      {
        event: 'command',
        func: 'addEventListener',
        args: ['onError'],
        id: 1,
        channel: 'widget',
      },
    ]) {
      target?.postMessage(JSON.stringify(message), YOUTUBE_ORIGIN);
    }
  };

  const original = YOUTUBE_PROVIDER.canonicalUrl(id);

  if (video?.status === 'ready' && video.url) {
    return (
      <div className={classNames(styles.fill, styles.copy, className)}>
        <video
          className={styles.fill}
          src={getURLFromString(video.url)}
          poster={getYoutubeThumbById(id)}
          title={title}
          autoPlay={autoplay}
          controls
          playsInline
        />

        <CopyBadges id={id} video={video} />
      </div>
    );
  }

  if (embedFailed) {
    return (
      <div className={classNames(styles.fill, styles.unavailable, className)}>
        <span>Видео недоступно</span>
        <a href={original} target="_blank" rel="noreferrer">
          Открыть на YouTube
        </a>
      </div>
    );
  }

  const params = new URLSearchParams({ enablejsapi: '1' });

  if (typeof window !== 'undefined') {
    params.set('origin', window.location.origin);
  }

  if (autoplay) {
    params.set('autoplay', '1');
  }

  return (
    <iframe
      ref={frame}
      className={classNames(styles.fill, className)}
      src={`${YOUTUBE_PROVIDER.embedUrl(id)}?${params}`}
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      frameBorder="0"
      allowFullScreen
      title={title || 'video'}
      onLoad={listen}
    />
  );
};

export { YoutubePlayer };
