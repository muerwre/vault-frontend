import React, { FC } from 'react';
import { ICommentBlockProps } from '~/constants/comment';
import styles from './styles.module.scss';

interface IProps extends ICommentBlockProps {}

const CommentTextBlock: FC<IProps> = ({ block }) => {
  return (
    <div
      className={styles.text}
      dangerouslySetInnerHTML={{
        __html: `<p>${block.content}</p>`,
      }}
    />
  );
};

export { CommentTextBlock };
