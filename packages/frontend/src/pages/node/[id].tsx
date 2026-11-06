import { FC } from 'react';

import { observer } from 'mobx-react-lite';
import { GetStaticPropsResult, InferGetStaticPropsType } from 'next';
import { RouteComponentProps } from 'react-router';

import { apiGetNode, apiGetNodeComments } from '~/api/node';
import { NodeHeadMetadata } from '~/components/node/NodeHeadMetadata';
import { COMMENTS_DISPLAY } from '~/constants/node';
import { useNodeComments } from '~/hooks/comments/useNodeComments';
import { useImageModal } from '~/hooks/navigation/useImageModal';
import { useLoadNode } from '~/hooks/node/useLoadNode';
import { useNodePageParams } from '~/hooks/node/useNodePageParams';
import { useNodePermissions } from '~/hooks/node/useNodePermissions';
import { useNodeTags } from '~/hooks/node/useNodeTags';
import { NodeLayout } from '~/layouts/NodeLayout';
import { IComment } from '~/types';
import { ApiGetNodeResponse } from '~/types/node';
import { CommentContextProvider } from '~/utils/context/CommentContextProvider';
import { NodeContextProvider } from '~/utils/context/NodeContextProvider';
import { TagsContextProvider } from '~/utils/context/TagsContextProvider';
import { NodeRelatedProvider } from '~/utils/providers/NodeRelatedProvider';

export const getStaticPaths = async () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      paths: [],
      fallback: 'blocking',
    };
  }

  return {
    // Nothing is pre-rendered: every node is generated on first request.
    paths: [],
    fallback: true,
  };
};

export const getStaticProps = async (
  context,
): Promise<
  GetStaticPropsResult<{
    fallbackData: ApiGetNodeResponse;
    comments?: IComment[];
  }>
> => {
  try {
    if (!context.params?.id) {
      return { notFound: true };
    }

    const id = parseInt(context.params.id, 10);
    if (!id) {
      return { notFound: true };
    }

    const [fallbackData, { comments }] = await Promise.all([
      apiGetNode({ id }),
      apiGetNodeComments({
        id,
        take: COMMENTS_DISPLAY,
      }),
    ]);

    return {
      props: {
        fallbackData: {
          ...fallbackData,
          last_seen: fallbackData.last_seen ?? null,
        },
        comments,
      },
      revalidate: 7 * 86400, // every week
    };
  } catch (error) {
    console.warn("[NEXT] can't generate node: ", error);
    return {
      notFound: true,
    };
  }
};

type Props = RouteComponentProps<{ id: string }> &
  InferGetStaticPropsType<typeof getStaticProps>;

const NodePage: FC<Props> = observer((props) => {
  const id = useNodePageParams();
  const { node, isLoading, update, lastSeen, backlinks } = useLoadNode(
    parseInt(id, 10),
    props.fallbackData,
  );

  const onShowImageModal = useImageModal();

  const {
    onLoadMoreComments,
    onLike: onLikeComment,
    onDelete: onDeleteComment,
    onEdit: onSaveComment,
    comments,
    hasMore,
    isLoading: isLoadingComments,
    isLoadingMore: isLoadingMoreComments,
  } = useNodeComments(parseInt(id, 10), props.comments);

  const {
    onDelete: onTagDelete,
    onChange: onTagsChange,
    onClick: onTagClick,
  } = useNodeTags(parseInt(id, 10));
  const [canEdit] = useNodePermissions(node);

  if (!node) {
    // TODO: do something here
    return null;
  }

  return (
    <NodeContextProvider
      node={node}
      isLoading={isLoading}
      update={update}
      backlinks={backlinks}
    >
      <NodeRelatedProvider id={parseInt(id, 10)} tags={node.tags}>
        <CommentContextProvider
          onLike={onLikeComment}
          onSaveComment={onSaveComment}
          comments={comments}
          hasMore={hasMore}
          lastSeenCurrent={lastSeen}
          isLoading={isLoadingComments}
          isLoadingMore={isLoadingMoreComments}
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
            <NodeHeadMetadata />
            <NodeLayout />
          </TagsContextProvider>
        </CommentContextProvider>
      </NodeRelatedProvider>
    </NodeContextProvider>
  );
});

export default NodePage;
