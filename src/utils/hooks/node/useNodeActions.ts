import { INode } from '~/redux/types';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { nodeLike, nodeLock, nodeStar } from '~/redux/node/actions';
import { modalShowDialog } from '~/redux/modal/actions';
import { NODE_EDITOR_DIALOGS } from '~/constants/dialogs';

export const useNodeActions = (node: INode) => {
  const dispatch = useDispatch();

  const onEdit = useCallback(() => {
    if (!node.type) {
      return;
    }

    dispatch(modalShowDialog(NODE_EDITOR_DIALOGS[node.type]));
  }, [dispatch, node]);

  const onLike = useCallback(() => dispatch(nodeLike(node.id)), [dispatch, node]);
  const onStar = useCallback(() => dispatch(nodeStar(node.id)), [dispatch, node]);
  const onLock = useCallback(() => dispatch(nodeLock(node.id, !node.deleted_at)), [dispatch, node]);

  return { onEdit, onLike, onStar, onLock };
};
