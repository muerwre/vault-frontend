import { useCallback } from 'react';

import { apiDeleteNodeTag, apiPostNodeTags } from '~/api/node';
import { Dialog } from '~/constants/modal';
import { useShowModal } from '~/hooks/modal/useShowModal';
import { useGetNodeRelated } from '~/hooks/node/useGetNodeRelated';
import { useLoadNode } from '~/hooks/node/useLoadNode';
import { ITag } from '~/types';

export const useNodeTags = (id: number) => {
  const showModal = useShowModal(Dialog.TagSidebar);
  const { refresh: refreshRelated } = useGetNodeRelated(id);
  const { update } = useLoadNode(id);

  const onChange = useCallback(
    async (tags: string[]) => {
      try {
        const result = await apiPostNodeTags({ id, tags });
        await update({ tags: result.node.tags });
        await refreshRelated();
      } catch (error) {
        console.warn(error);
      }
    },
    [id, update, refreshRelated]
  );

  const onClick = useCallback(
    (tag: Partial<ITag>) => {
      if (!id || !tag?.title) {
        return;
      }

      showModal({ tag: tag.title });
    },
    [showModal, id]
  );

  const onDelete = useCallback(
    async (tagId: ITag['ID']) => {
      try {
        const result = await apiDeleteNodeTag({ id, tagId });
        await update({ tags: result.tags });
        await refreshRelated();
      } catch (e) {
        console.warn(e);
      }
    },
    [id, update, refreshRelated]
  );

  return { onDelete, onChange, onClick };
};
