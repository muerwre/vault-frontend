import React, { FC } from 'react';
import { NodeLayout } from '~/layouts/NodeLayout';
import { RouteComponentProps } from 'react-router';
import { useScrollToTop } from '~/utils/hooks/useScrollToTop';
import { useFullNode } from '~/utils/hooks/node/useFullNode';
import { useImageModal } from '~/utils/hooks/useImageModal';
import { useNodeComments } from '~/utils/hooks/node/useNodeComments';
import { useUser } from '~/utils/hooks/user/userUser';
import { useNodeTags } from '~/utils/hooks/node/useNodeTags';
import { NodeProvider } from '~/utils/providers/NodeProvider';
import { CommentProvider } from '~/utils/providers/CommentProvider';
import { TagProvider } from '~/utils/providers/TagProvider';
import { useNodePermissions } from '~/utils/hooks/node/useNodePermissions';

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
  const { onLoadMoreComments, onDelete: onDeleteComment } = useNodeComments(parseInt(id, 10));
  const { onDelete: onTagDelete, onChange: onTagsChange, onClick: onTagClick } = useNodeTags(
    parseInt(id, 10)
  );
  const user = useUser();
  const [canEdit] = useNodePermissions(node);

  useScrollToTop([id, isLoadingComments]);

  return (
    <NodeProvider node={node} related={related} isUser={user.is_user} isLoading={isLoading}>
      <CommentProvider
        node={node}
        user={user}
        comments={comments}
        count={commentsCount}
        lastSeenCurrent={lastSeenCurrent}
        isLoadingNode={isLoading}
        isLoadingComments={isLoadingComments}
        onShowImageModal={onShowImageModal}
        onLoadMoreComments={onLoadMoreComments}
        onDeleteComment={onDeleteComment}
      >
        <TagProvider
          tags={node.tags}
          canAppend={user.is_user}
          canDelete={canEdit}
          isLoading={isLoading}
          onChange={onTagsChange}
          onTagClick={onTagClick}
          onTagDelete={onTagDelete}
        >
          <NodeLayout />
        </TagProvider>
      </CommentProvider>
    </NodeProvider>
  );
};

export default NodePage;
