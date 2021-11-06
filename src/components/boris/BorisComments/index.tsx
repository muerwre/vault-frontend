import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';
import { NodeCommentForm } from '~/components/node/NodeCommentForm';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { NodeComments } from '~/components/node/NodeComments';
import { Footer } from '~/components/main/Footer';
import { IComment, IFile, INode } from '~/redux/types';
import { IUser } from '~/redux/auth/types';

interface IProps {
  node: INode;
  user: IUser;
  commentCount: number;
  comments: IComment[];
  isLoadingComments: boolean;
  onShowImageModal: (images: IFile[], index: number) => void;
  onLoadMoreComments: () => void;
  onDeleteComment: (id: IComment['id'], isLocked: boolean) => void;
}

const BorisComments: FC<IProps> = ({
  node,
  user,
  isLoadingComments,
  commentCount,
  comments,
  onLoadMoreComments,
  onDeleteComment,
  onShowImageModal,
}) => {
  return (
    <>
      <Group className={styles.grid}>
        {user.is_user && <NodeCommentForm isBefore nodeId={node.id} />}

        {isLoadingComments ? (
          <NodeNoComments is_loading count={7} />
        ) : (
          <NodeComments
            comments={comments}
            count={commentCount}
            user={user}
            order="ASC"
            onDeleteComment={onDeleteComment}
            onLoadMoreComments={onLoadMoreComments}
            onShowImageModal={onShowImageModal}
          />
        )}
      </Group>

      <Footer />
    </>
  );
};

export { BorisComments };
