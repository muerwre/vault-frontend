import { FC, HTMLAttributes, memo } from 'react';

import classNames from 'classnames';
import { parseISO } from 'date-fns';

import { NEW_COMMENT_CLASSNAME } from '~/constants/comment';
import { CommentWrapper } from '~/containers/comments/CommentWrapper';
import { IComment, ICommentGroup, IFile } from '~/types';

import { CommendDeleted } from '../../../../../components/node/CommendDeleted';

import { CommentContent } from './components/CommentContent';
import { CommentDistance } from './components/CommentDistance';
import styles from './styles.module.scss';

type Props = HTMLAttributes<HTMLDivElement> & {
  nodeId: number;
  isEmpty?: boolean;
  isLoading?: boolean;
  group: ICommentGroup;
  isSame?: boolean;
  canEdit?: boolean;
  canLike?: boolean;
  highlighted?: boolean;
  saveComment: (data: IComment) => Promise<IComment | undefined>;
  onDelete: (id: IComment['id'], isLocked: boolean) => void;
  onLike: (id: IComment['id'], isLiked: boolean) => void;
  onShowImageModal: (images: IFile[], index: number) => void;
};

const Comment: FC<Props> = memo(
  ({
    group,
    nodeId,
    isEmpty,
    isSame,
    isLoading,
    className,
    highlighted,
    canEdit,
    canLike,
    onDelete,
    onLike,
    onShowImageModal,
    saveComment,
    ...props
  }) => {
    return (
      <CommentWrapper
        className={classNames(styles.container, className, {
          [NEW_COMMENT_CLASSNAME]: group.hasNew,
          [styles.highlighted]: highlighted,
        })}
        isEmpty={isEmpty}
        isLoading={isLoading}
        user={group.user}
        isNew={group.hasNew && !isSame}
        {...props}
      >
        <div className={styles.wrap}>
          {group.comments.map((comment, index) => {
            if (comment.deleted_at) {
              return (
                <CommendDeleted
                  id={comment.id}
                  onDelete={onDelete}
                  key={comment.id}
                />
              );
            }

            const prefix = Math.abs(group.distancesInDays[index]) > 14 && (
              <CommentDistance
                firstDate={
                  comment?.created_at ? parseISO(comment.created_at) : undefined
                }
                secondDate={
                  index > 0 && group.comments[index - 1]?.created_at
                    ? parseISO(group.comments[index - 1].created_at!)
                    : undefined
                }
              />
            );

            return (
              <CommentContent
                prefix={prefix}
                saveComment={saveComment}
                nodeId={nodeId}
                comment={comment}
                canEdit={!!canEdit}
                canLike={!!canLike}
                onLike={() => onLike(comment.id, !comment.liked)}
                onDelete={(val: boolean) => onDelete(comment.id, val)}
                onShowImageModal={onShowImageModal}
                key={comment.id}
              />
            );
          })}
        </div>
      </CommentWrapper>
    );
  },
);

export { Comment };
