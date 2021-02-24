import React, { FC } from 'react';
import { ICommentBlockProps } from '~/constants/comment';
import styles from './styles.module.scss';

interface IProps extends ICommentBlockProps {}

const CommentTextBlock: FC<IProps> = ({ block }) => {
  return (
    <div
      className={styles.text}
      dangerouslySetInnerHTML={{
        __html: block.content,
      }}
    />
  );
};

export { CommentTextBlock };
