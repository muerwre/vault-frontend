import { INode } from '~/redux/types';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { nodeEdit, nodeLike, nodeLock, nodeStar } from '~/redux/node/actions';

export const useNodeActions = (node: INode) => {
  const dispatch = useDispatch();

  const onEdit = useCallback(() => dispatch(nodeEdit(node.id)), [dispatch, nodeEdit, node]);
  const onLike = useCallback(() => dispatch(nodeLike(node.id)), [dispatch, nodeLike, node]);
  const onStar = useCallback(() => dispatch(nodeStar(node.id)), [dispatch, nodeStar, node]);
  const onLock = useCallback(() => dispatch(nodeLock(node.id, !node.deleted_at)), [
    dispatch,
    nodeLock,
    node,
  ]);

  return { onEdit, onLike, onStar, onLock };
};
