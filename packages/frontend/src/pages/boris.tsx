import { VFC } from 'react';

import { observer } from 'mobx-react-lite';

import { PageTitle } from '~/components/common/PageTitle';
import { BORIS_NODE_ID } from '~/constants/boris/constants';
import { MembersOnly } from '~/containers/auth/MembersOnly';
import { useBoris } from '~/hooks/boris/useBoris';
import { useNodeComments } from '~/hooks/comments/useNodeComments';
import { useImageModal } from '~/hooks/navigation/useImageModal';
import { useLoadNode } from '~/hooks/node/useLoadNode';
import { BorisLayout } from '~/layouts/BorisLayout';
import { CommentContextProvider } from '~/utils/context/CommentContextProvider';
import { NodeContextProvider } from '~/utils/context/NodeContextProvider';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

const BorisContent: VFC = observer(() => {
  const { node, isLoading, update } = useLoadNode(BORIS_NODE_ID);

  const onShowImageModal = useImageModal();

  const {
    onLoadMoreComments,
    onDelete: onDeleteComment,
    onEdit: onSaveComment,
    onLike: onLikeComment,
    comments,
    hasMore,
    isLoading: isLoadingComments,
    isLoadingMore,
  } = useNodeComments(BORIS_NODE_ID);

  const { title, stats, isLoadingStats } = useBoris(comments);

  return (
    <NodeContextProvider node={node} isLoading={isLoading} update={update}>
      <CommentContextProvider
        onSaveComment={onSaveComment}
        comments={comments}
        hasMore={hasMore}
        onLike={onLikeComment}
        isLoading={isLoadingComments}
        isLoadingMore={isLoadingMore}
        onShowImageModal={onShowImageModal}
        onLoadMoreComments={onLoadMoreComments}
        onDeleteComment={onDeleteComment}
      >
        <PageTitle title={getPageTitle('Борис')} />

        <BorisLayout
          title={title}
          stats={stats}
          isLoadingStats={isLoadingStats}
        />
      </CommentContextProvider>
    </NodeContextProvider>
  );
});

const BorisPage: VFC = () => (
  <MembersOnly>
    <BorisContent />
  </MembersOnly>
);

export default BorisPage;
