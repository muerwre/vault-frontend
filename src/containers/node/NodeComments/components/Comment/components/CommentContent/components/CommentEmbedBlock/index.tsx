import { FC, memo, useCallback, useMemo } from 'react';

import { Icon } from '~/components/common/Icon';
import { ICommentBlockProps } from '~/constants/comment';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useYoutubeMetadata } from '~/hooks/metadata/useYoutubeMetadata';
import { getYoutubeThumb } from '~/utils/dom';
import { useVideoPlayer } from '~/utils/providers/VideoPlayerProvider';

import { CommentVideoFrame } from './components/CommentVideoFrame';
import styles from './styles.module.scss';

type Props = ICommentBlockProps & {};

const CommentEmbedBlock: FC<Props> = memo(({ block }) => {
  const { isTablet } = useWindowSize();
  const { url, setUrl } = useVideoPlayer();

  const id = useMemo(() => {
    const match = block.content.match(
      /https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch)?(?:\?v=)?([\w\-=]+)/,
    );

    return (match && match[1]) || '';
  }, [block.content]);

  const address = `https://youtube.com/watch?v=${id}`;

  const preview = useMemo(
    () => getYoutubeThumb(block.content),
    [block.content],
  );

  const metadata = useYoutubeMetadata(id);
  const title = metadata?.metadata?.title || '';

  const onClick = useCallback(() => {
    if (isTablet) {
      window.open(address, '_blank');
      return;
    }

    setUrl(address);
  }, [isTablet, setUrl, address]);

  const closeVideo = useCallback(() => setUrl(''), [setUrl]);

  return (
    <div className={styles.embed}>
      {url === address ? (
        <div className={styles.video}>
          <div className={styles.close} onClick={closeVideo}>
            <Icon icon="close" />
          </div>
          <div className={styles.animation}>
            <CommentVideoFrame id={id} title={title} />
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
