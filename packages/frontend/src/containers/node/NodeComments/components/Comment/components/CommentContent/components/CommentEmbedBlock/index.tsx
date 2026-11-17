import { FC, useCallback, useMemo } from 'react';

import { observer } from 'mobx-react-lite';

import { Icon } from '~/components/common/Icon';
import { ICommentBlockProps } from '~/constants/comment';
import { imagePresets } from '~/constants/urls';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useYoutubeMetadata } from '~/hooks/metadata/useYoutubeMetadata';
import { getURLFromString, getYoutubeId, getYoutubeThumb } from '~/utils/dom';
import { useVideoPlayer } from '~/utils/providers/VideoPlayerProvider';

import { CommentVideoFrame } from './components/CommentVideoFrame';
import styles from './styles.module.scss';

type Props = ICommentBlockProps & {};

const CommentEmbedBlock: FC<Props> = observer(({ block }) => {
  const { isTablet } = useWindowSize();
  const { url, setUrl } = useVideoPlayer();

  const id = useMemo(
    () => getYoutubeId(block.content.trim()) ?? '',
    [block.content],
  );

  const address = `https://youtube.com/watch?v=${id}`;

  const preview = useMemo(
    () => getYoutubeThumb(block.content, imagePresets[600]),
    [block.content],
  );

  const metadata = useYoutubeMetadata(id);
  const title = metadata?.metadata?.title || '';
  const video = metadata?.video;

  // A phone opens our copy when there is one: YouTube may not be reachable.
  const external =
    video?.status === 'ready' && video.url
      ? getURLFromString(video.url)
      : address;

  const onClick = useCallback(() => {
    if (isTablet) {
      window.open(external, '_blank');
      return;
    }

    setUrl(address);
  }, [isTablet, setUrl, address, external]);

  const closeVideo = useCallback(() => setUrl(''), [setUrl]);

  return (
    <div className={styles.embed}>
      {url === address ? (
        <div className={styles.video}>
          <div className={styles.close} onClick={closeVideo}>
            <Icon icon="close" />
          </div>
          <div className={styles.animation}>
            <CommentVideoFrame id={id} title={title} video={video} />
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

export { CommentEmbedBlock };
