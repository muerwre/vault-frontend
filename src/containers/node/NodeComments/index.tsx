import React, { FC, memo, useMemo } from 'react';

import { Comment } from '~/components/comment/Comment';
import { LoadMoreButton } from '~/components/input/LoadMoreButton';
import { useGrouppedComments } from '~/hooks/node/useGrouppedComments';
import { ICommentGroup } from '~/types';
import { useCommentContext } from '~/utils/context/CommentContextProvider';
import { useNodeContext } from '~/utils/context/NodeContextProvider';
import { useUserContext } from '~/utils/context/UserContextProvider';
import { canEditComment } from '~/utils/node';

import styles from './styles.module.scss';

interface IProps {
  order: 'ASC' | 'DESC';
}

const NodeComments: FC<IProps> = memo(({ order }) => {
  const user = useUserContext();
  const { node } = useNodeContext();

  const {
    comments,
    hasMore,
    isLoading,
    isLoadingMore,
    lastSeenCurrent,
    onLoadMoreComments,
    onDeleteComment,
    onShowImageModal,
    onSaveComment,
  } = useCommentContext();

  const groupped: ICommentGroup[] = useGrouppedComments(
    comments,
    order,
    lastSeenCurrent ?? undefined
  );

  const more = useMemo(
    () =>
      hasMore && <div className={styles.more}>
        <LoadMoreButton isLoading={isLoadingMore} onClick={onLoadMoreComments} />
      </div>,
    [hasMore, onLoadMoreComments, isLoadingMore]
  );

  if (!node?.id) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      {order === 'DESC' && more}

      {groupped.map(group => (
        <Comment
          nodeId={node.id!}
          key={group.ids.join()}
          group={group}
          canEdit={canEditComment(group, user)}
          onDelete={onDeleteComment}
          onShowImageModal={onShowImageModal}
          isSame={group.user.id === user.id}
          saveComment={onSaveComment}
        />
      ))}

      {order === 'ASC' && more}
    </div>
  );
});

export { NodeComments };
