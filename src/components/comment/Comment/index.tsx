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
  group: ICommentGroup;
  isSame?: boolean;
  canEdit?: boolean;
  onDelete: (id: IComment['id'], isLocked: boolean) => void;
  modalShowPhotoswipe: typeof MODAL_ACTIONS.modalShowPhotoswipe;
};

const Comment: FC<IProps> = memo(
  ({
    group,
    is_empty,
    isSame,
    is_loading,
    className,
    canEdit,
    onDelete,
    modalShowPhotoswipe,
    ...props
  }) => {
    return (
      <CommentWrapper
        className={classNames(className, {
          [NEW_COMMENT_CLASSNAME]: group.hasNew,
        })}
        isEmpty={is_empty}
        isLoading={is_loading}
        user={group.user}
        isNew={group.hasNew && !isSame}
        {...props}
      >
        <div className={styles.wrap}>
          {group.comments.map(comment => {
            if (comment.deleted_at) {
              return <CommendDeleted id={comment.id} onDelete={onDelete} key={comment.id} />;
            }

            return (
              <CommentContent
                comment={comment}
                key={comment.id}
                can_edit={!!canEdit}
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
