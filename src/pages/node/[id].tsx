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
import { observer } from 'mobx-react-lite';
import { useNodePageParams } from '~/hooks/node/useNodePageParams';
import { GetServerSidePropsContext } from 'next';
import { apiGetNode } from '~/api/node';
import { ApiGetNodeResponse } from '~/types/node';

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string }, ApiGetNodeResponse>
) {
  const id = parseInt(context.query.id as string, 10);

  if (!id) {
    return { props: {} };
  }

  const fallbackData = await apiGetNode({ id });

  return {
    props: {
      fallbackData: {
        ...fallbackData,
        last_seen: fallbackData.last_seen ?? null,
      },
    },
  };
}

type Props = RouteComponentProps<{ id: string }> & {
  fallbackData?: ApiGetNodeResponse;
};

const NodePage: FC<Props> = observer(props => {
  const id = useNodePageParams();
  const { node, isLoading, update, lastSeen } = useLoadNode(parseInt(id, 10), props.fallbackData);

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
});

export default NodePage;
