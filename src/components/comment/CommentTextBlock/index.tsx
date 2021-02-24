import React, { FC, useMemo } from 'react';
import { ICommentBlockProps } from '~/constants/comment';
import styles from './styles.module.scss';
import classNames from 'classnames';
import markdown from '~/styles/common/markdown.module.scss';
import { formatText } from '~/utils/dom';

interface IProps extends ICommentBlockProps {}

const CommentTextBlock: FC<IProps> = ({ block }) => {
  const content = useMemo(() => formatText(block.content), [block.content]);

  return (
    <div
      className={classNames(styles.text, markdown.wrapper)}
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
};

export { CommentTextBlock };
