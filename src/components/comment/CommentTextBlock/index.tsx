import React, { FC } from 'react';
import { ICommentBlockProps } from '~/constants/comment';
import styles from './styles.module.scss';
import classNames from 'classnames';
import markdown from '~/styles/common/markdown.module.scss';
import { formatText } from '~/utils/dom';

interface IProps extends ICommentBlockProps {}

const CommentTextBlock: FC<IProps> = ({ block }) => {
  return (
    <div
      className={classNames(styles.text, markdown.wrapper)}
      dangerouslySetInnerHTML={{
        __html: formatText(block.content),
      }}
    />
  );
};

export { CommentTextBlock };
