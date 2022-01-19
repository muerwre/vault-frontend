import { useCallback } from 'react';

import { apiLockNode, apiPostNodeHeroic, apiPostNodeLike } from '~/api/node';
import { Dialog } from '~/constants/modal';
import { useModal } from '~/hooks/modal/useModal';
import { INode } from '~/types';
import { showErrorToast } from '~/utils/errors/showToast';

export const useNodeActions = (node: INode, update: (node: Partial<INode>) => Promise<unknown>) => {
  const { showModal } = useModal();

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

  const onEdit = useCallback(() => showModal(Dialog.EditNode, { nodeId: node.id! }), [
    node,
    showModal,
  ]);

  return { onLike, onStar, onLock, onEdit };
};
