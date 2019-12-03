import React, { FC, HTMLAttributes, memo } from 'react';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import { ICommentGroup, IComment } from '~/redux/types';
import { CommentContent } from '~/components/node/CommentContent';
import * as styles from './styles.scss';
import { nodeLockComment, nodeEditComment } from '~/redux/node/actions';
import { INodeState } from '~/redux/node/reducer';
import { CommentForm } from '../CommentForm';
import { CommendDeleted } from '../CommendDeleted';

type IProps = HTMLAttributes<HTMLDivElement> & {
  is_empty?: boolean;
  is_loading?: boolean;
  comment_group?: ICommentGroup;
  comment_data: INodeState['comment_data'];
  is_same?: boolean;
  can_edit?: boolean;
  onDelete: typeof nodeLockComment;
  onEdit: typeof nodeEditComment;
};

const Comment: FC<IProps> = memo(
  ({
    comment_group,
    comment_data,
    is_empty,
    is_same,
    is_loading,
    className,
    can_edit,
    onDelete,
    onEdit,
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
          {comment_group.comments.map(comment => {
            if (comment.deleted_at) {
              return <CommendDeleted id={comment.id} onDelete={onDelete} key={comment.id} />;
            }

            if (Object.prototype.hasOwnProperty.call(comment_data, comment.id)) {
              return <CommentForm id={comment.id} key={comment.id} />;
            }

            return (
              <CommentContent
                comment={comment}
                key={comment.id}
                can_edit={can_edit}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            );
          })}
        </div>
      </CommentWrapper>
    );
  }
);

export { Comment };
