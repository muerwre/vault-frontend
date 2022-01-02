import { useShallowSelect } from '~/hooks/data/useShallowSelect';
import { selectNode } from '~/redux/node/selectors';
import { useLoadNode } from '~/hooks/node/useLoadNode';
import { useOnNodeSeen } from '~/hooks/node/useOnNodeSeen';

export const useFullNode = (id: string) => {
  const {
    is_loading: isLoading,
    current: node,
    comments,
    comment_count: commentsCount,
    is_loading_comments: isLoadingComments,
    lastSeenCurrent,
  } = useShallowSelect(selectNode);

  useLoadNode(id);
  // useOnNodeSeen(node);

  return { node, comments, commentsCount, lastSeenCurrent, isLoading, isLoadingComments };
};
