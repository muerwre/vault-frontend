import { FC, useMemo } from 'react';

import classNames from 'classnames';

import { ICommentBlockProps } from '~/constants/comment';
import markdown from '~/styles/common/markdown.module.scss';
import { formatText } from '~/utils/dom';

import styles from './styles.module.scss';

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
