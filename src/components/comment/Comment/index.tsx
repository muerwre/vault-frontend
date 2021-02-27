import React, { FC, HTMLAttributes, memo } from 'react';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import { ICommentGroup } from '~/redux/types';
import { CommentContent } from '~/components/comment/CommentContent';
import styles from './styles.module.scss';
import { nodeEditComment, nodeLockComment } from '~/redux/node/actions';
import { INodeState } from '~/redux/node/reducer';
import { CommendDeleted } from '../../node/CommendDeleted';
import * as MODAL_ACTIONS from '~/redux/modal/actions';

type IProps = HTMLAttributes<HTMLDivElement> & {
  is_empty?: boolean;
  is_loading?: boolean;
  comment_group: ICommentGroup;
  comment_data: INodeState['comment_data'];
  is_same?: boolean;
  can_edit?: boolean;
  onDelete: typeof nodeLockComment;
  onEdit: typeof nodeEditComment;
  modalShowPhotoswipe: typeof MODAL_ACTIONS.modalShowPhotoswipe;
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
    modalShowPhotoswipe,
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

            return (
              <CommentContent
                comment={comment}
                key={comment.id}
                can_edit={!!can_edit}
                onDelete={onDelete}
                modalShowPhotoswipe={modalShowPhotoswipe}
              />
            );
          })}
        </div>
      </CommentWrapper>
    );
  }
);

export { Comment };
