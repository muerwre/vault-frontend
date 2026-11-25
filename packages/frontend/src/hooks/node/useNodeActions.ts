import { useCallback } from 'react';

import {
  apiLockNode,
  apiPostNodeHeroic,
  apiPostNodeLike,
  apiPostNodePin,
} from '~/api/node';
import { features } from '~/constants/features';
import { Dialog } from '~/constants/modal/dialog';
import { URLS } from '~/constants/urls';
import { useModal } from '~/hooks/modal/useModal';
import { useNavigation } from '~/hooks/navigation/useNavigation';
import { useInvalidateProfileNodes } from '~/hooks/profile/useProfileNodes';
import { INode } from '~/types';
import { showErrorToast } from '~/utils/errors/showToast';

export const useNodeActions = (
  node: INode,
  update: (node: Partial<INode>) => Promise<unknown>,
) => {
  const { showModal } = useModal();
  const { push } = useNavigation();
  const editOnPage = !features.editorModals;
  const invalidateProfile = useInvalidateProfileNodes();

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

  // only reorders the author's profile; the feeds are unaffected
  const onPin = useCallback(async () => {
    try {
      const result = await apiPostNodePin({
        id: node.id,
        is_pinned: !node.is_pinned,
      });
      await update({ is_pinned: result.is_pinned });
      await invalidateProfile(node.user?.username);
    } catch (error) {
      showErrorToast(error);
    }
  }, [node.id, node.is_pinned, node.user?.username, update, invalidateProfile]);

  const onLock = useCallback(async () => {
    try {
      const result = await apiLockNode({
        id: node.id,
        is_locked: !node.deleted_at,
      });
      await update({ deleted_at: result.deleted_at });
      await invalidateProfile(node.user?.username);
    } catch (error) {
      showErrorToast(error);
    }
  }, [
    node.deleted_at,
    node.id,
    node.user?.username,
    update,
    invalidateProfile,
  ]);

  // on the submission page, unless the old modals are switched back on
  const onEdit = useCallback(() => {
    if (editOnPage) {
      push(URLS.EDIT(node.id!));
      return;
    }

    showModal(Dialog.EditNode, { nodeId: node.id! });
  }, [editOnPage, node, push, showModal]);

  return { onLike, onStar, onPin, onLock, onEdit };
};
