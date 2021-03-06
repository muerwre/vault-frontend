import React, { FC } from 'react';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { NodeComments } from '~/components/node/NodeComments';
import { IComment, INode } from '~/redux/types';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';
import { useUser } from '~/utils/hooks/user/userUser';

interface IProps {
  order: 'ASC' | 'DESC';
  node: INode;
  comments: IComment[];
  count: number;
  isLoading: boolean;
  isLoadingComments: boolean;
}

const NodeCommentsBlock: FC<IProps> = ({ isLoading, isLoadingComments, node, comments, count }) => {
  const user = useUser();
  const { inline } = useNodeBlocks(node, isLoading);

  return isLoading || isLoadingComments || (!comments.length && !inline) ? (
    <NodeNoComments is_loading={isLoadingComments || isLoading} />
  ) : (
    <NodeComments count={count} comments={comments} user={user} order="DESC" />
  );
};

export { NodeCommentsBlock };
