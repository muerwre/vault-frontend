import React, { VFC } from "react";

import { observer } from "mobx-react-lite";

import { PageTitle } from "~/components/common/PageTitle";
import { useBoris } from "~/hooks/boris/useBoris";
import { useNodeComments } from "~/hooks/comments/useNodeComments";
import { useImageModal } from "~/hooks/navigation/useImageModal";
import { useLoadNode } from "~/hooks/node/useLoadNode";
import { BorisLayout } from "~/layouts/BorisLayout";
import { CommentContextProvider } from "~/utils/context/CommentContextProvider";
import { NodeContextProvider } from "~/utils/context/NodeContextProvider";
import { getPageTitle } from "~/utils/ssr/getPageTitle";

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
    isLoadingMore,
  } = useNodeComments(696);
  const { title, stats, isLoadingStats } = useBoris(comments);

  return (
    <NodeContextProvider node={node} isLoading={isLoading} update={update}>
      <CommentContextProvider
        onSaveComment={onSaveComment}
        comments={comments}
        hasMore={hasMore}
        isLoading={isLoadingComments}
        isLoadingMore={isLoadingMore}
        onShowImageModal={onShowImageModal}
        onLoadMoreComments={onLoadMoreComments}
        onDeleteComment={onDeleteComment}
      >
        <PageTitle title={getPageTitle("Борис")} />

        <BorisLayout
          title={title}
          stats={stats}
          isLoadingStats={isLoadingStats}
        />
      </CommentContextProvider>
    </NodeContextProvider>
  );
});

export default BorisPage;
