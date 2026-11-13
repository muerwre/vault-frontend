import { useCallback } from 'react';

import { apiLockNode, apiPostNodeHeroic, apiPostNodeLike } from '~/api/node';
import { features } from '~/constants/features';
import { Dialog } from '~/constants/modal';
import { URLS } from '~/constants/urls';
import { useModal } from '~/hooks/modal/useModal';
import { useNavigation } from '~/hooks/navigation/useNavigation';
import { INode } from '~/types';
import { showErrorToast } from '~/utils/errors/showToast';

export const useNodeActions = (
  node: INode,
  update: (node: Partial<INode>) => Promise<unknown>,
) => {
  const { showModal } = useModal();
  const { push } = useNavigation();
  const editOnPage = !features.editorModals;

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
      const result = await apiLockNode({
        id: node.id,
        is_locked: !node.deleted_at,
      });
      await update({ deleted_at: result.deleted_at });
    } catch (error) {
      showErrorToast(error);
    }
  }, [node.deleted_at, node.id, update]);

  // on the submission page, unless the old modals are switched back on
  const onEdit = useCallback(() => {
    if (editOnPage) {
      push(URLS.EDIT(node.id!));
      return;
    }

    showModal(Dialog.EditNode, { nodeId: node.id! });
  }, [editOnPage, node, push, showModal]);

  return { onLike, onStar, onLock, onEdit };
};
