import { useMemo } from 'react';

import { useUser } from '~/hooks/auth/useUser';
import { INode } from '~/types';
import { canEditNode, canLikeNode, canStarNode } from '~/utils/node';

import { useAuth } from '../auth/useAuth';

export const useNodePermissions = (node?: INode) => {
  const { user } = useUser();
  const { fetched, isUser } = useAuth();

  const edit = useMemo(
    () => fetched && isUser && canEditNode(node, user),
    [node, user, fetched, isUser],
  );
  const like = useMemo(
    () => fetched && isUser && canLikeNode(node, user),
    [node, user, fetched, isUser],
  );
  const star = useMemo(
    () => fetched && isUser && canStarNode(node, user),
    [node, user, fetched, isUser],
  );

  return [edit, like, star];
};
