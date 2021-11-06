import React, { FC } from 'react';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { NodeComments } from '~/components/node/NodeComments';
import { IComment, IFile, INode } from '~/redux/types';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';
import { IUser } from '~/redux/auth/types';

interface IProps {
  order: 'ASC' | 'DESC';
  node: INode;
  user: IUser;
  comments: IComment[];
  count: number;
  lastSeenCurrent?: string;
  isLoading: boolean;
  isLoadingComments: boolean;
  onShowImageModal: (images: IFile[], index: number) => void;
  onLoadMoreComments: () => void;
  onDeleteComment: (id: IComment['id'], isLocked: boolean) => void;
}

const NodeCommentsBlock: FC<IProps> = ({
  node,
  user,
  comments,
  count,
  lastSeenCurrent,
  isLoading,
  isLoadingComments,
  onLoadMoreComments,
  onDeleteComment,
  onShowImageModal,
}) => {
  const { inline } = useNodeBlocks(node, isLoading);

  return isLoading || isLoadingComments || (!comments.length && !inline) ? (
    <NodeNoComments is_loading={isLoadingComments || isLoading} />
  ) : (
    <NodeComments
      count={count}
      comments={comments}
      user={user}
      order="DESC"
      lastSeenCurrent={lastSeenCurrent}
      onShowImageModal={onShowImageModal}
      onLoadMoreComments={onLoadMoreComments}
      onDeleteComment={onDeleteComment}
    />
  );
};

export { NodeCommentsBlock };
