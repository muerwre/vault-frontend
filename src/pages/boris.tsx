import React, { VFC } from 'react';

import { observer } from 'mobx-react-lite';

import { useBoris } from '~/hooks/boris/useBoris';
import { useNodeComments } from '~/hooks/comments/useNodeComments';
import { useImageModal } from '~/hooks/navigation/useImageModal';
import { useLoadNode } from '~/hooks/node/useLoadNode';
import { BorisLayout } from '~/layouts/BorisLayout';
import { CommentContextProvider } from '~/utils/context/CommentContextProvider';
import { NodeContextProvider } from '~/utils/context/NodeContextProvider';


const BorisPage: VFC = observer(() => {
  const { node, isLoading, update } = useLoadNode(696);

  const onShowImageModal = useImageModal();
  const {
    onLoadMoreComments,
    onDelete: onDeleteComment,
    onEdit: onSaveComment,
    comments,
    hasMore,
    isLoading: isLoadingComments,
  } = useNodeComments(696);
  const { title, setIsBetaTester, isTester, stats, isLoadingStats } = useBoris(comments);

  return (
    <NodeContextProvider node={node} isLoading={isLoading} update={update}>
      <CommentContextProvider
        onSaveComment={onSaveComment}
        comments={comments}
        hasMore={hasMore}
        isLoading={isLoadingComments}
        onShowImageModal={onShowImageModal}
        onLoadMoreComments={onLoadMoreComments}
        onDeleteComment={onDeleteComment}
      >
        <BorisLayout
          title={title}
          setIsBetaTester={setIsBetaTester}
          isTester={isTester}
          stats={stats}
          isLoadingStats={isLoadingStats}
        />
      </CommentContextProvider>
    </NodeContextProvider>
  );
});

export default BorisPage;
