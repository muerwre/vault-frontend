import React, { FC } from 'react';
import { ICommentBlockProps } from '~/constants/comment';
import styles from './styles.scss';

interface IProps extends ICommentBlockProps {}

const CommentTextBlock: FC<IProps> = ({ block }) => {
  return (
    <div
      className={styles.text}
      dangerouslySetInnerHTML={{
        __html: `<p>${block.content} <span class="${styles.blank}"></span></p>`,
      }}
    />
  );
};

export { CommentTextBlock };
