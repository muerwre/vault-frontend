import React, { FC, HTMLAttributes, memo } from 'react';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import { ICommentGroup, IComment } from '~/redux/types';
import { CommentContent } from '~/components/node/CommentContent';
import * as styles from './styles.scss';

type IProps = HTMLAttributes<HTMLDivElement> & {
  is_empty?: boolean;
  is_loading?: boolean;
  comment_group?: ICommentGroup;
  is_same?: boolean;
  can_edit?: boolean;
  onDelete: (id: IComment['id'], is_deteted: boolean) => void;
};

const Comment: FC<IProps> = memo(
  ({ comment_group, is_empty, is_same, is_loading, className, can_edit, onDelete, ...props }) => {
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
          {comment_group.comments.map(comment =>
            comment.deleted_at ? (
              <div key={comment.id}>deleted</div>
            ) : (
              <CommentContent
                comment={comment}
                key={comment.id}
                can_edit={can_edit}
                onDelete={onDelete}
              />
            )
          )}
        </div>
      </CommentWrapper>
    );
  }
);

export { Comment };
