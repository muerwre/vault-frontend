import React, { FC, memo, useMemo } from 'react';

import styles from './styles.module.scss';
import { ICommentGroup } from '~/redux/types';
import { canEditComment } from '~/utils/node';
import { COMMENTS_DISPLAY } from '~/redux/node/constants';
import { plural } from '~/utils/dom';
import { useGrouppedComments } from '~/hooks/node/useGrouppedComments';
import { useCommentContext } from '~/utils/context/CommentContextProvider';
import { Comment } from '~/components/comment/Comment';
import { useUserContext } from '~/utils/context/UserContextProvider';
import { useNodeContext } from '~/utils/context/NodeContextProvider';

interface IProps {
  order: 'ASC' | 'DESC';
}

const NodeComments: FC<IProps> = memo(({ order }) => {
  const user = useUserContext();
  const { node } = useNodeContext();

  const {
    comments,
    hasMore,
    lastSeenCurrent,
    onLoadMoreComments,
    onDeleteComment,
    onShowImageModal,
    onSaveComment,
  } = useCommentContext();

  const groupped: ICommentGroup[] = useGrouppedComments(comments, order, lastSeenCurrent);

  const more = useMemo(
    () =>
      hasMore && (
        <div className={styles.more} onClick={onLoadMoreComments}>
          Показать ещё комментарии
        </div>
      ),
    [hasMore, onLoadMoreComments]
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
