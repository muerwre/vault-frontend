import React, { FC, HTMLAttributes, memo } from 'react';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import { IComment, ICommentGroup } from '~/redux/types';
import { CommentContent } from '~/components/comment/CommentContent';
import styles from './styles.module.scss';
import { CommendDeleted } from '../../node/CommendDeleted';
import * as MODAL_ACTIONS from '~/redux/modal/actions';
import classNames from 'classnames';
import { NEW_COMMENT_CLASSNAME } from '~/constants/comment';

type IProps = HTMLAttributes<HTMLDivElement> & {
  is_empty?: boolean;
  is_loading?: boolean;
  comment_group: ICommentGroup;
  is_same?: boolean;
  can_edit?: boolean;
  onDelete: (id: IComment['id'], isLocked: boolean) => void;
  modalShowPhotoswipe: typeof MODAL_ACTIONS.modalShowPhotoswipe;
};

const Comment: FC<IProps> = memo(
  ({
    comment_group,
    is_empty,
    is_same,
    is_loading,
    className,
    can_edit,
    onDelete,
    modalShowPhotoswipe,
    ...props
  }) => {
    return (
      <CommentWrapper
        className={classNames(className, {
          [NEW_COMMENT_CLASSNAME]: comment_group.hasNew,
        })}
        isEmpty={is_empty}
        isLoading={is_loading}
        user={comment_group.user}
        isSame={is_same}
        isNew={comment_group.hasNew}
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
