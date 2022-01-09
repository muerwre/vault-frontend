import React, { FC } from 'react';
import { NodeLayout } from '~/layouts/NodeLayout';
import { RouteComponentProps } from 'react-router';
import { useScrollToTop } from '~/hooks/dom/useScrollToTop';
import { useImageModal } from '~/hooks/navigation/useImageModal';
import { useNodeComments } from '~/hooks/comments/useNodeComments';
import { useNodeTags } from '~/hooks/node/useNodeTags';
import { NodeContextProvider } from '~/utils/context/NodeContextProvider';
import { CommentContextProvider } from '~/utils/context/CommentContextProvider';
import { TagsContextProvider } from '~/utils/context/TagsContextProvider';
import { useNodePermissions } from '~/hooks/node/useNodePermissions';
import { NodeRelatedProvider } from '~/utils/providers/NodeRelatedProvider';
import { useLoadNode } from '~/hooks/node/useLoadNode';
import { observer } from 'mobx-react';

type Props = RouteComponentProps<{ id: string }> & {};

const NodePage: FC<Props> = observer(
  ({
    match: {
      params: { id },
    },
  }) => {
    const { node, isLoading, update, lastSeen } = useLoadNode(parseInt(id, 10));

    const onShowImageModal = useImageModal();
    const {
      onLoadMoreComments,
      onDelete: onDeleteComment,
      onEdit: onSaveComment,
      comments,
      hasMore,
      isLoading: isLoadingComments,
    } = useNodeComments(parseInt(id, 10));
    const { onDelete: onTagDelete, onChange: onTagsChange, onClick: onTagClick } = useNodeTags(
      parseInt(id, 10)
    );
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
            onSaveComment={onSaveComment}
            comments={comments}
            hasMore={hasMore}
            lastSeenCurrent={lastSeen}
            isLoading={isLoadingComments}
            onShowImageModal={onShowImageModal}
            onLoadMoreComments={onLoadMoreComments}
            onDeleteComment={onDeleteComment}
          >
            <TagsContextProvider
              tags={node.tags}
              canAppend={canEdit}
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
  }
);

export default NodePage;
