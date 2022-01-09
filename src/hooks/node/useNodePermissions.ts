import { useMemo } from 'react';
import { canEditNode, canLikeNode, canStarNode } from '~/utils/node';
import { INode } from '~/types';
import { useUser } from '~/hooks/auth/useUser';

export const useNodePermissions = (node?: INode) => {
  const { user } = useUser();

  const edit = useMemo(() => canEditNode(node, user), [node, user]);
  const like = useMemo(() => canLikeNode(node, user), [node, user]);
  const star = useMemo(() => canStarNode(node, user), [node, user]);

  return [edit, like, star];
};
