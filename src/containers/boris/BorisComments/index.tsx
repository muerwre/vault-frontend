import React, { FC } from 'react';

import { Group } from '~/components/containers/Group';
import { Footer } from '~/components/main/Footer';
import { NodeCommentForm } from '~/components/node/NodeCommentForm';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { isSSR } from '~/constants/ssr';
import { NodeComments } from '~/containers/node/NodeComments';
import { useAuth } from '~/hooks/auth/useAuth';
import { CommentContextProvider, useCommentContext } from '~/utils/context/CommentContextProvider';
import { useNodeContext } from '~/utils/context/NodeContextProvider';
import { useUserContext } from '~/utils/context/UserContextProvider';

interface IProps {}

const BorisComments: FC<IProps> = () => {
  const user = useUserContext();
  const { isUser } = useAuth();

  const {
    isLoading,
    comments,
    onSaveComment,
    onLoadMoreComments,
    onDeleteComment,
    onShowImageModal,
    hasMore,
  } = useCommentContext();
  const { node } = useNodeContext();

  return (
    <CommentContextProvider
      onSaveComment={onSaveComment}
      comments={comments}
      hasMore={hasMore}
      onDeleteComment={onDeleteComment}
      onLoadMoreComments={onLoadMoreComments}
      onShowImageModal={onShowImageModal}
      isLoading={isLoading}
    >
      <Group>
        {(isUser || isSSR) && (
          <NodeCommentForm user={user} nodeId={node.id} saveComment={onSaveComment} />
        )}

        {isLoading || !comments?.length ? (
          <NodeNoComments is_loading count={7} />
        ) : (
          <NodeComments order="ASC" />
        )}

        {comments?.length && <NodeComments order="ASC" />}

        <Footer />
      </Group>
    </CommentContextProvider>
  );
};

export { BorisComments };
