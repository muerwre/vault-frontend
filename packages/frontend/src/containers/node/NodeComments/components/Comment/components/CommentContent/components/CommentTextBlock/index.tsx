import { FC, useMemo } from 'react';

import classNames from 'classnames';

import { ICommentBlockProps } from '~/constants/comment';
import { useMentionClicks } from '~/hooks/navigation/useMentionClicks';
import markdown from '~/styles/common/markdown.module.scss';
import { formatText } from '~/utils/dom';

import styles from './styles.module.scss';

interface Props extends ICommentBlockProps {}

const CommentTextBlock: FC<Props> = ({ block }) => {
  const content = useMemo(() => formatText(block.content), [block.content]);
  const onClick = useMentionClicks();

  return (
    <div
      className={classNames(styles.text, markdown.wrapper)}
      onClick={onClick}
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
};

export { CommentTextBlock };
