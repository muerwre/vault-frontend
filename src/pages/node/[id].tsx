import React, { FC } from 'react';

import { observer } from 'mobx-react-lite';
import { GetStaticPropsResult, InferGetStaticPropsType } from 'next';
import { RouteComponentProps } from 'react-router';

import { apiGetNode, apiGetNodeComments, getNodeDiff } from '~/api/node';
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
import { uniqBy } from '~/utils/ramda';

export const getStaticPaths = async () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      paths: [],
      fallback: 'blocking',
    };
  }

  const recent = await getNodeDiff({
    with_heroes: false,
    with_recent: true,
    with_updated: true,
    with_valid: false,
  });

  const recentIDs = uniqBy(
    (it) => it.id,
    [
      ...(recent.after || []),
      ...(recent.before || []),
      ...(recent.recent || []),
    ],
  )
    .filter((it) => it.id)
    .map((it) => it.id!.toString());

  return {
    paths: recentIDs.map((id) => ({ params: { id } })),
    fallback: 'blocking',
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
    console.warn(`[NEXT] can't generate node: `, error);
    return {
      notFound: true,
    };
  }
};

type Props = RouteComponentProps<{ id: string }> &
  InferGetStaticPropsType<typeof getStaticProps>;

const NodePage: FC<Props> = observer((props) => {
  const id = useNodePageParams();
  const { node, isLoading, update, lastSeen } = useLoadNode(
    parseInt(id, 10),
    props.fallbackData,
  );

  const onShowImageModal = useImageModal();

  const {
    onLoadMoreComments,
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
    <NodeContextProvider node={node} isLoading={isLoading} update={update}>
      <NodeRelatedProvider id={parseInt(id, 10)} tags={node.tags}>
        <CommentContextProvider
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
