import { useCallback } from 'react';

import { apiDeleteNodeTag, apiPostNodeTags } from '~/api/node';
import { useGetNodeRelated } from '~/hooks/node/useGetNodeRelated';
import { useLoadNode } from '~/hooks/node/useLoadNode';
import { ITag } from '~/types';

import { useTagSidebar } from '../sidebar/useTagSidebar';

export const useNodeTags = (id: number) => {
  const openTagSidebar = useTagSidebar();
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
    [id, update, refreshRelated],
  );

  const onClick = useCallback(
    (tag: Partial<ITag>) => {
      if (!id || !tag?.title) {
        return;
      }

      openTagSidebar(tag.title);
    },
    [openTagSidebar, id],
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
    [id, update, refreshRelated],
  );

  return { onDelete, onChange, onClick };
};
