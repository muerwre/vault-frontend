import React, { FC, memo, useMemo } from 'react';
import { ICommentBlockProps } from '~/constants/comment';
import styles from './styles.module.scss';
import { getYoutubeThumb } from '~/utils/dom';
import { Icon } from '~/components/input/Icon';
import { useYoutubeMetadata } from '~/hooks/metadata/useYoutubeMetadata';

type Props = ICommentBlockProps & {};

const CommentEmbedBlock: FC<Props> = memo(({ block }) => {
  const id = useMemo(() => {
    const match = block.content.match(
      /https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch)?(?:\?v=)?([\w\-=]+)/
    );

    return (match && match[1]) || '';
  }, [block.content]);

  const url = useMemo(() => `https://youtube.com/watch?v=${id}`, [id]);

  const preview = useMemo(() => getYoutubeThumb(block.content), [block.content]);

  const metadata = useYoutubeMetadata(id);
  const title = metadata?.metadata?.title || '';

  return (
    <div className={styles.embed}>
      <a href={url} target="_blank" rel="noreferrer" />

      <div className={styles.preview}>
        <div style={{ backgroundImage: `url("${preview}")` }}>
          <div className={styles.backdrop}>
            <div className={styles.play}>
              <Icon icon="play" size={32} />
            </div>

            <div className={styles.title}>{title}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export { CommentEmbedBlock };
