import React, { FC } from 'react';

import { Group } from '~/components/containers/Group';
import { Footer } from '~/components/main/Footer';
import { NodeCommentForm } from '~/components/node/NodeCommentForm';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { NodeComments } from '~/containers/node/NodeComments';
import { useAuth } from '~/hooks/auth/useAuth';
import { CommentContextProvider, useCommentContext } from '~/utils/context/CommentContextProvider';
import { useNodeContext } from '~/utils/context/NodeContextProvider';
import { useUserContext } from '~/utils/context/UserContextProvider';

import styles from './styles.module.scss';

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
    <>
      <Group className={styles.grid}>
        {isUser && <NodeCommentForm user={user} nodeId={node.id} saveComment={onSaveComment} />}

        {isLoading ? (
          <NodeNoComments is_loading count={7} />
        ) : (
          <CommentContextProvider
            onSaveComment={onSaveComment}
            comments={comments}
            hasMore={hasMore}
            onDeleteComment={onDeleteComment}
            onLoadMoreComments={onLoadMoreComments}
            onShowImageModal={onShowImageModal}
            isLoading={isLoading}
          >
            <NodeComments order="ASC" />
          </CommentContextProvider>
        )}
      </Group>

      <Footer />
    </>
  );
};

export { BorisComments };
