import React, { FC, memo } from 'react';
import { ICommentBlock } from '~/constants/comment';
import styles from './styles.scss';

interface IProps {
  block: ICommentBlock;
}

const CommentEmbedBlock: FC<IProps> = memo(({ block }) => {
  const link = block.content.match(
    /(https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch)?(\?v=)?[\w\-]+)/gi
  );

  return (
    <div className={styles.text}>
      <a href={link[0]} target="_blank">
        {link[0]}
      </a>
    </div>
  );
});

export { CommentEmbedBlock };
