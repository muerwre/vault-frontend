import React, { FC, memo, useMemo } from 'react';
import { ICommentBlock } from '~/constants/comment';
import styles from './styles.scss';
import { getYoutubeTitle, getYoutubeThumb } from '~/utils/dom';
import { Icon } from '~/components/input/Icon';

interface IProps {
  block: ICommentBlock;
}

const CommentEmbedBlock: FC<IProps> = memo(({ block }) => {
  const link = block.content.match(
    /(https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch)?(\?v=)?[\w\-\&\=]+)/gi
  );

  const preview = useMemo(() => getYoutubeThumb(block.content), [block.content]);

  return (
    <div className={styles.embed}>
      <a href={link[0]} target="_blank" />

      <div className={styles.preview}>
        <div style={{ backgroundImage: `url("${preview}")` }}>
          <div className={styles.backdrop}>{link[0]}</div>
        </div>
      </div>
    </div>
  );
});

export { CommentEmbedBlock };
