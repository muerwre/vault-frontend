import { INode } from '~/redux/types';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { nodeEdit, nodeLike, nodeLock, nodeStar } from '~/redux/node/actions';

export const useNodeActions = (node?: INode) => {
  const dispatch = useDispatch();

  const onEdit = useCallback(() => {
    if (!node?.id) {
      return;
    }
    dispatch(nodeEdit(node.id));
  }, [node]);
  const onLike = useCallback(() => {
    if (!node?.id) {
      return;
    }
    dispatch(nodeLike(node.id));
  }, [node]);
  const onStar = useCallback(() => {
    if (!node?.id) {
      return;
    }
    dispatch(nodeStar(node.id));
  }, [node]);
  const onLock = useCallback(() => {
    if (!node?.id) {
      return;
    }
    dispatch(nodeLock(node.id, !node.deleted_at));
  }, [node]);

  return { onEdit, onLike, onStar, onLock };
};
