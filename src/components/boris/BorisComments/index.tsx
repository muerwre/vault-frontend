import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';
import { NodeCommentForm } from '~/components/node/NodeCommentForm';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { NodeComments } from '~/views/node/NodeComments';
import { Footer } from '~/components/main/Footer';
import { CommentProvider, useCommentContext } from '~/utils/providers/CommentProvider';
import { useUserContext } from '~/utils/providers/UserProvider';
import { useNodeContext } from '~/utils/providers/NodeProvider';

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
          <CommentProvider
            comments={comments}
            count={count}
            onDeleteComment={onDeleteComment}
            onLoadMoreComments={onLoadMoreComments}
            onShowImageModal={onShowImageModal}
            isLoading={isLoading}
          >
            <NodeComments order="ASC" />
          </CommentProvider>
        )}
      </Group>

      <Footer />
    </>
  );
};

export { BorisComments };
