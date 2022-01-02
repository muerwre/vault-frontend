import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';
import { NodeCommentForm } from '~/components/node/NodeCommentForm';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { NodeComments } from '~/containers/node/NodeComments';
import { Footer } from '~/components/main/Footer';
import { CommentContextProvider, useCommentContext } from '~/utils/context/CommentContextProvider';
import { useUserContext } from '~/utils/context/UserContextProvider';
import { useNodeContext } from '~/utils/context/NodeContextProvider';

interface IProps {}

const BorisComments: FC<IProps> = () => {
  const user = useUserContext();
  const {
    isLoading,
    comments,
    onLoadMoreComments,
    onDeleteComment,
    onShowImageModal,
    count,
  } = useCommentContext();
  const { node } = useNodeContext();

  return (
    <>
      <Group className={styles.grid}>
        {user.is_user && <NodeCommentForm isBefore nodeId={node.id} />}

        {isLoading ? (
          <NodeNoComments is_loading count={7} />
        ) : (
          <CommentContextProvider
            comments={comments}
            count={count}
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