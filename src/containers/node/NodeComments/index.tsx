import { FC, useMemo } from 'react';

import { observer } from 'mobx-react-lite';

import { LoadMoreButton } from '~/components/input/LoadMoreButton';
import { ANNOUNCE_USER_ID, BORIS_NODE_ID } from '~/constants/boris/constants';
import { Comment } from '~/containers/node/NodeComments/components/Comment';
import { useGrouppedComments } from '~/hooks/node/useGrouppedComments';
import { ICommentGroup } from '~/types';
import { useCommentContext } from '~/utils/context/CommentContextProvider';
import { useNodeContext } from '~/utils/context/NodeContextProvider';
import { useUserContext } from '~/utils/context/UserContextProvider';
import { canEditComment, canLikeComment } from '~/utils/node';

import styles from './styles.module.scss';

interface Props {
  order: 'ASC' | 'DESC';
}

const NodeComments: FC<Props> = observer(({ order }) => {
  const user = useUserContext();
  const { node } = useNodeContext();

  const {
    comments,
    hasMore,
    isLoading,
    isLoadingMore,
    lastSeenCurrent,
    onLike,
    onLoadMoreComments,
    onDeleteComment,
    onShowImageModal,
    onSaveComment,
  } = useCommentContext();

  const groupped: ICommentGroup[] = useGrouppedComments(
    comments,
    order,
    lastSeenCurrent ?? undefined,
  );

  const more = useMemo(
    () =>
      hasMore &&
      !isLoading && (
        <div className={styles.more}>
          <LoadMoreButton
            isLoading={isLoadingMore}
            onClick={onLoadMoreComments}
          />
        </div>
      ),
    [hasMore, onLoadMoreComments, isLoadingMore, isLoading],
  );

  if (!node?.id) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      {order === 'DESC' && more}

      {groupped.map((group) => (
        <Comment
          nodeId={node.id!}
          key={group.ids.join()}
          group={group}
          highlighted={
            node.id === BORIS_NODE_ID && group.user.id === ANNOUNCE_USER_ID
          }
          onLike={onLike}
          canLike={canLikeComment(group, user)}
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
