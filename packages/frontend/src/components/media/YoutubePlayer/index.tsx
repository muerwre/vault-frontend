import { FC, useEffect, useRef, useState } from 'react';

import { YOUTUBE_PROVIDER } from '@vault/common/media';
import type { IEmbedVideo } from '@vault/common/types';
import classNames from 'classnames';

import { getURLFromString, getYoutubeThumbById } from '~/utils/dom';

import styles from './styles.module.scss';

const YOUTUBE_ORIGIN = 'https://www.youtube.com';

/**
 * Embed errors meaning the video will not play here: removed or private (100),
 * or embedding disabled by its owner (101, 150).
 */
const UNPLAYABLE = [100, 101, 150];

/** How long to wait to learn whether a copy exists before falling back to YouTube. */
const PENDING_WAIT_MS = 2_000;

interface Props {
  id: string;
  title?: string;
  autoplay?: boolean;
  /** Our copy, as the metadata endpoint reports it. */
  video?: IEmbedVideo;
  /** Whether it is still unknown if a copy exists. */
  pending?: boolean;
  className?: string;
}

/**
 * A YouTube video. Our copy plays whenever there is one, since YouTube is not
 * reachable everywhere; YouTube's own player otherwise.
 */
const YoutubePlayer: FC<Props> = ({
  id,
  title,
  autoplay,
  video,
  pending,
  className,
}) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const [embedFailed, setEmbedFailed] = useState(false);
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    if (!pending) {
      return;
    }

    const timer = setTimeout(() => setWaited(true), PENDING_WAIT_MS);

    return () => clearTimeout(timer);
  }, [pending]);

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

        <a
          className={styles.original}
          href={original}
          target="_blank"
          rel="noreferrer"
          title="Оригинал на YouTube"
        >
          YouTube ↗
        </a>
      </div>
    );
  }

  if (pending && !waited) {
    return <div className={classNames(styles.fill, className)} />;
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
