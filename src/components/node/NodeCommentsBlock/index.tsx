import React, { FC } from 'react';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { NodeComments } from '~/components/node/NodeComments';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';
import { useCommentContext } from '~/utils/providers/CommentProvider';

interface IProps {
  order: 'ASC' | 'DESC';
}

const NodeCommentsBlock: FC<IProps> = () => {
  const {
    node,
    user,
    comments,
    count,
    lastSeenCurrent,
    isLoadingNode,
    isLoadingComments,
    onLoadMoreComments,
    onDeleteComment,
    onShowImageModal,
  } = useCommentContext();
  const { inline } = useNodeBlocks(node, isLoadingNode);

  return isLoadingNode || isLoadingComments || (!comments.length && !inline) ? (
    <NodeNoComments is_loading={isLoadingComments || isLoadingNode} />
  ) : (
    <NodeComments
      count={count}
      comments={comments}
      user={user}
      order="DESC"
      lastSeenCurrent={lastSeenCurrent}
      onShowImageModal={onShowImageModal}
      onLoadMoreComments={onLoadMoreComments}
      onDeleteComment={onDeleteComment}
    />
  );
};

export { NodeCommentsBlock };
