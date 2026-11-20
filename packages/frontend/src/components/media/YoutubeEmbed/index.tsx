import { FC, useCallback, useMemo } from 'react';

import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { Icon } from '~/components/common/Icon';
import { imagePresets } from '~/constants/urls';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useYoutubeMetadata } from '~/hooks/metadata/useYoutubeMetadata';
import { getURLFromString, getYoutubeId, getYoutubeThumb } from '~/utils/dom';
import { useVideoPlayer } from '~/utils/providers/VideoPlayerProvider';

import { YoutubeEmbedFrame } from './components/YoutubeEmbedFrame';
import styles from './styles.module.scss';

interface Props {
  /** A YouTube link, in any form `getYoutubeId` understands. */
  url: string;
  /** Twice as tall a preview, for a video standing on its own in a post. */
  big?: boolean;
  /** A click opens the video's page instead of playing it here. */
  asLink?: boolean;
  /** Adds a cross at the top corner that calls this. Big previews only. */
  onDelete?: () => void;
}

/**
 * A YouTube video's preview with its title. A click plays it in place, one
 * video at a time among those under the same `VideoPlayerProvider`; phones
 * open it instead.
 */
const YoutubeEmbed: FC<Props> = observer(({ url, big, asLink, onDelete }) => {
  const { isTablet } = useWindowSize();
  // the video playing among those sharing the player, if any
  const { url: playing, setUrl } = useVideoPlayer();

  const id = useMemo(() => getYoutubeId(url.trim()) ?? '', [url]);

  const address = `https://youtube.com/watch?v=${id}`;

  const preview = useMemo(() => getYoutubeThumb(url, imagePresets[600]), [url]);

  const metadata = useYoutubeMetadata(id);
  const title = metadata?.metadata?.title || '';
  const video = metadata?.video;

  // A phone opens our copy when there is one: YouTube may not be reachable.
  const external =
    video?.status === 'ready' && video.url
      ? getURLFromString(video.url)
      : address;

  const onClick = useCallback(() => {
    if (asLink) {
      window.open(address, '_blank');
      return;
    }

    if (isTablet) {
      window.open(external, '_blank');
      return;
    }

    setUrl(address);
  }, [asLink, isTablet, setUrl, address, external]);

  const closeVideo = useCallback(() => setUrl(''), [setUrl]);

  return (
    <div className={classNames(styles.embed, { [styles.big]: big })}>
      {big && onDelete && (
        <button
          type="button"
          className={styles.delete}
          onClick={onDelete}
          aria-label="Убрать видео"
        >
          <Icon icon="close" size={20} />
        </button>
      )}

      {playing === address ? (
        <div className={styles.video}>
          <div className={styles.close} onClick={closeVideo}>
            <Icon icon="close" />
          </div>
          <div className={styles.animation}>
            <YoutubeEmbedFrame id={id} title={title} video={video} />
          </div>
        </div>
      ) : (
        <div
          className={styles.preview}
          role="button"
          onClick={onClick}
          tabIndex={-1}
        >
          <div style={{ backgroundImage: `url("${preview}")` }}>
            <div className={styles.backdrop}>
              <div className={styles.play}>
                <Icon icon="play" size={32} />
              </div>

              <div className={styles.title}>{title}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export { YoutubeEmbed };
