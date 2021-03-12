import { useMemo } from 'react';
import { canEditNode, canLikeNode, canStarNode } from '~/utils/node';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectUser } from '~/redux/auth/selectors';
import { INode } from '~/redux/types';

export const useNodePermissions = (node: INode) => {
  const user = useShallowSelect(selectUser);
  const edit = useMemo(() => canEditNode(node, user), [node, user]);
  const like = useMemo(() => canLikeNode(node, user), [node, user]);
  const star = useMemo(() => canStarNode(node, user), [node, user]);

  return [edit, like, star];
};
