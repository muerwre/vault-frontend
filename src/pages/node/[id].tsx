import React, { FC } from 'react';
import { NodeLayout } from '~/layouts/NodeLayout';
import { RouteComponentProps } from 'react-router';
import { useScrollToTop } from '~/hooks/dom/useScrollToTop';
import { useFullNode } from '~/hooks/node/useFullNode';
import { useImageModal } from '~/hooks/navigation/useImageModal';
import { useNodeComments } from '~/hooks/node/useNodeComments';
import { useUser } from '~/hooks/user/userUser';
import { useNodeTags } from '~/hooks/node/useNodeTags';
import { NodeContextProvider } from '~/utils/context/NodeContextProvider';
import { CommentContextProvider } from '~/utils/context/CommentContextProvider';
import { TagsContextProvider } from '~/utils/context/TagsContextProvider';
import { useNodePermissions } from '~/hooks/node/useNodePermissions';
import { NodeRelatedProvider } from '~/utils/providers/NodeRelatedProvider';
import { useGetNode } from '~/hooks/node/useGetNode';

type Props = RouteComponentProps<{ id: string }> & {};

const NodePage: FC<Props> = ({
  match: {
    params: { id },
  },
}) => {
  const { node, isLoading, update } = useGetNode(parseInt(id, 10));
  const { isLoadingComments, comments, commentsCount, lastSeenCurrent } = useFullNode(id);

  const onShowImageModal = useImageModal();
  const { onLoadMoreComments, onDelete: onDeleteComment } = useNodeComments(parseInt(id, 10));
  const { onDelete: onTagDelete, onChange: onTagsChange, onClick: onTagClick } = useNodeTags(
    parseInt(id, 10)
  );
  const user = useUser();
  const [canEdit] = useNodePermissions(node);

  useScrollToTop([id, isLoadingComments]);

  if (!node) {
    // TODO: do something here
    return null;
  }

  return (
    <NodeContextProvider node={node} isLoading={isLoading} update={update}>
      <NodeRelatedProvider id={parseInt(id, 10)} tags={node.tags}>
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
