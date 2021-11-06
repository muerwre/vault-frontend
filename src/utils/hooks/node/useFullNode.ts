import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectNode } from '~/redux/node/selectors';
import { useLoadNode } from '~/utils/hooks/node/useLoadNode';
import { useOnNodeSeen } from '~/utils/hooks/node/useOnNodeSeen';

export const useFullNode = (id: string) => {
  const {
    is_loading: isLoading,
    current: node,
    comments,
    comment_count: commentsCount,
    is_loading_comments: isLoadingComments,
    related,
    lastSeenCurrent,
  } = useShallowSelect(selectNode);

  useLoadNode(id, isLoading);
  useOnNodeSeen(node);

  return { node, comments, commentsCount, related, lastSeenCurrent, isLoading, isLoadingComments };
};
