import React, { FC, HTMLAttributes, memo } from 'react';

import classNames from 'classnames';

import { CommentContent } from '~/components/comment/CommentContent';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import { NEW_COMMENT_CLASSNAME } from '~/constants/comment';
import { IComment, ICommentGroup, IFile } from '~/types';

import { CommendDeleted } from '../../node/CommendDeleted';

import styles from './styles.module.scss';


type IProps = HTMLAttributes<HTMLDivElement> & {
  nodeId: number;
  isEmpty?: boolean;
  isLoading?: boolean;
  group: ICommentGroup;
  isSame?: boolean;
  canEdit?: boolean;
  saveComment: (data: IComment) => Promise<unknown>;
  onDelete: (id: IComment['id'], isLocked: boolean) => void;
  onShowImageModal: (images: IFile[], index: number) => void;
};

const Comment: FC<IProps> = memo(
  ({
    group,
    nodeId,
    isEmpty,
    isSame,
    isLoading,
    className,
    canEdit,
    onDelete,
    onShowImageModal,
    saveComment,
    ...props
  }) => {
    return (
      <CommentWrapper
        className={classNames(className, {
          [NEW_COMMENT_CLASSNAME]: group.hasNew,
        })}
        isEmpty={isEmpty}
        isLoading={isLoading}
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
                saveComment={saveComment}
                nodeId={nodeId}
                comment={comment}
                key={comment.id}
                canEdit={!!canEdit}
                onDelete={onDelete}
                onShowImageModal={onShowImageModal}
              />
            );
          })}
        </div>
      </CommentWrapper>
    );
  }
);

export { Comment };
