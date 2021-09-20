import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';
import { NodeCommentForm } from '~/components/node/NodeCommentForm';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { NodeComments } from '~/components/node/NodeComments';
import { Footer } from '~/components/main/Footer';
import { Card } from '~/components/containers/Card';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectAuthUser } from '~/redux/auth/selectors';
import { IComment, IFile, INode } from '~/redux/types';

interface IProps {
  isLoadingComments: boolean;
  commentCount: number;
  node?: INode;
  comments: IComment[];
  onDelete: (id: IComment['id'], locked: boolean) => void;
  onLoadMoreComments: () => void;
  onShowPhotoswipe: (images: IFile[], index: number) => void;
}

const BorisComments: FC<IProps> = ({
  node,
  commentCount,
  comments,
  isLoadingComments,
  onLoadMoreComments,
  onDelete,
  onShowPhotoswipe,
}) => {
  const user = useShallowSelect(selectAuthUser);

  return (
    <>
      <Group className={styles.grid}>
        {user.is_user && <NodeCommentForm isBefore nodeId={node?.id} />}

        {isLoadingComments ? (
          <NodeNoComments is_loading count={7} />
        ) : (
          <NodeComments
            comments={comments}
            count={commentCount}
            user={user}
            order="ASC"
            onLoadMoreComments={onLoadMoreComments}
            onDelete={onDelete}
            onShowPhotoswipe={onShowPhotoswipe}
          />
        )}
      </Group>

      <Footer />
    </>
  );
};

export { BorisComments };
