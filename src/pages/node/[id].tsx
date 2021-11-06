import React, { FC } from 'react';
import { NodeLayout } from '~/layouts/NodeLayout';
import { RouteComponentProps } from 'react-router';
import { useScrollToTop } from '~/utils/hooks/useScrollToTop';
import { useFullNode } from '~/utils/hooks/node/useFullNode';

type Props = RouteComponentProps<{ id: string }> & {};

const NodePage: FC<Props> = ({
  match: {
    params: { id },
  },
}) => {
  const {
    node,
    isLoading,
    isLoadingComments,
    comments,
    commentsCount,
    related,
    lastSeenCurrent,
  } = useFullNode(id);

  useScrollToTop([id, isLoadingComments]);

  return (
    <NodeLayout
      node={node}
      related={related}
      lastSeenCurrent={lastSeenCurrent}
      comments={comments}
      commentsCount={commentsCount}
      isLoading={isLoading}
      isLoadingComments={isLoadingComments}
    />
  );
};

export default NodePage;
