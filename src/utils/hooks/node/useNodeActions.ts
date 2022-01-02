import { INode } from '~/redux/types';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { modalShowDialog } from '~/redux/modal/actions';
import { NODE_EDITOR_DIALOGS } from '~/constants/dialogs';
import { apiLockNode, apiPostNodeHeroic, apiPostNodeLike } from '~/redux/node/api';
import { showErrorToast } from '~/utils/errors/showToast';

export const useNodeActions = (node: INode, update: (node: Partial<INode>) => Promise<unknown>) => {
  const dispatch = useDispatch();

  const onEdit = useCallback(() => {
    if (!node.type) {
      return;
    }

    dispatch(modalShowDialog(NODE_EDITOR_DIALOGS[node.type]));
  }, [dispatch, node]);

  const onLike = useCallback(async () => {
    try {
      const result = await apiPostNodeLike({ id: node.id });
      const likeCount = node.like_count || 0;

      if (result.is_liked) {
        await update({ like_count: likeCount + 1 });
      } else {
        await update({ like_count: likeCount - 1 });
      }
    } catch (error) {
      showErrorToast(error);
    }
  }, [node.id, node.like_count, update]);

  const onStar = useCallback(async () => {
    try {
      const result = await apiPostNodeHeroic({ id: node.id });
      await update({ is_heroic: result.is_heroic });
    } catch (error) {
      showErrorToast(error);
    }
  }, [node.id, update]);

  const onLock = useCallback(async () => {
    try {
      const result = await apiLockNode({ id: node.id, is_locked: !node.deleted_at });
      await update({ deleted_at: result.deleted_at });
    } catch (error) {
      showErrorToast(error);
    }
  }, [node.deleted_at, node.id, update]);

  return { onEdit, onLike, onStar, onLock };
};
