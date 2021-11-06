import React, { FC } from 'react';
import { NodeLayout } from '~/layouts/NodeLayout';
import { RouteComponentProps } from 'react-router';
import { useScrollToTop } from '~/utils/hooks/useScrollToTop';
import { useFullNode } from '~/utils/hooks/node/useFullNode';
import { useImageModal } from '~/utils/hooks/useImageModal';
import { useNodeComments } from '~/utils/hooks/node/useNodeComments';
import { useUser } from '~/utils/hooks/user/userUser';

type Props = RouteComponentProps<{ id: string }> & {};

const NodePage: FC<Props> = ({
  match: {
    params: { id },
  },
}) => {
  const {
    node,
    isLoading,
    isLoadingComments,
    comments,
    commentsCount,
    related,
    lastSeenCurrent,
  } = useFullNode(id);

  const onShowImageModal = useImageModal();
  const { onLoadMoreComments, onDelete: onDeleteComment } = useNodeComments(id);
  const user = useUser();
  useScrollToTop([id, isLoadingComments]);

  return (
    <NodeLayout
      node={node}
      user={user}
      related={related}
      lastSeenCurrent={lastSeenCurrent}
      comments={comments}
      commentsCount={commentsCount}
      isUser={user.is_user}
      isLoading={isLoading}
      isLoadingComments={isLoadingComments}
      onShowImageModal={onShowImageModal}
      onLoadMoreComments={onLoadMoreComments}
      onDeleteComment={onDeleteComment}
    />
  );
};

export default NodePage;
