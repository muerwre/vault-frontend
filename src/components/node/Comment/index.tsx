import React, { FC, HTMLAttributes } from 'react';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import { ICommentGroup } from '~/redux/types';
import { getURL } from '~/utils/dom';
import { CommentContent } from '~/components/node/CommentContent';
import * as styles from './styles.scss';

type IProps = HTMLAttributes<HTMLDivElement> & {
  is_empty?: boolean;
  is_loading?: boolean;
  comment_group?: ICommentGroup;
  is_same?: boolean;
};

const Comment: FC<IProps> = ({
  comment_group,
  is_empty,
  is_same,
  is_loading,
  className,
  ...props
}) => {
  return (
    <CommentWrapper
      className={className}
      is_empty={is_empty}
      is_loading={is_loading}
      user={comment_group.user}
      is_same={is_same}
      {...props}
    >
      <div className={styles.wrap}>
        {comment_group.comments.map(comment => (
          <CommentContent comment={comment} key={comment.id} />
        ))}
      </div>
    </CommentWrapper>
  );
};

export { Comment };
