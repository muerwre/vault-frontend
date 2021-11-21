import React, { FC } from 'react';
import { NodeLayout } from '~/layouts/NodeLayout';
import { RouteComponentProps } from 'react-router';
import { useScrollToTop } from '~/utils/hooks/useScrollToTop';
import { useFullNode } from '~/utils/hooks/node/useFullNode';
import { useImageModal } from '~/utils/hooks/useImageModal';
import { useNodeComments } from '~/utils/hooks/node/useNodeComments';
import { useUser } from '~/utils/hooks/user/userUser';
import { useNodeTags } from '~/utils/hooks/node/useNodeTags';
import { NodeContextProvider } from '~/utils/context/NodeContextProvider';
import { CommentContextProvider } from '~/utils/context/CommentContextProvider';
import { TagsContextProvider } from '~/utils/context/TagsContextProvider';
import { useNodePermissions } from '~/utils/hooks/node/useNodePermissions';
import { NodeRelatedProvider } from '~/utils/providers/NodeRelatedProvider';

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
    <NodeContextProvider node={node} isLoading={isLoading}>
      <NodeRelatedProvider id={parseInt(id, 10)}>
        <CommentContextProvider
          comments={comments}
          count={commentsCount}
          lastSeenCurrent={lastSeenCurrent}
          isLoading={isLoadingComments}
          onShowImageModal={onShowImageModal}
          onLoadMoreComments={onLoadMoreComments}
          onDeleteComment={onDeleteComment}
        >
          <TagsContextProvider
            tags={node.tags}
            canAppend={user.is_user}
            canDelete={canEdit}
            isLoading={isLoading}
            onChange={onTagsChange}
            onTagClick={onTagClick}
            onTagDelete={onTagDelete}
          >
            <NodeLayout />
          </TagsContextProvider>
        </CommentContextProvider>
      </NodeRelatedProvider>
    </NodeContextProvider>
  );
};

export default NodePage;
