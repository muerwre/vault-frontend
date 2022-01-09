import { useHistory } from 'react-router';
import { useCallback } from 'react';
import { ITag } from '~/types';
import { URLS } from '~/constants/urls';
import { useLoadNode } from '~/hooks/node/useLoadNode';
import { apiDeleteNodeTag, apiPostNodeTags } from '~/api/node';

export const useNodeTags = (id: number) => {
  const { update } = useLoadNode(id);
  const history = useHistory();

  const onChange = useCallback(
    async (tags: string[]) => {
      try {
        const result = await apiPostNodeTags({ id, tags });
        await update({ tags: result.node.tags });
      } catch (error) {
        console.warn(error);
      }
    },
    [id, update]
  );

  const onClick = useCallback(
    (tag: Partial<ITag>) => {
      if (!id || !tag?.title) {
        return;
      }

      history.push(URLS.NODE_TAG_URL(id, encodeURIComponent(tag.title)));
    },
    [history, id]
  );

  const onDelete = useCallback(
    async (tagId: ITag['ID']) => {
      try {
        const result = await apiDeleteNodeTag({ id, tagId });
        await update({ tags: result.tags });
      } catch (e) {
        console.warn(e);
      }
    },
    [id, update]
  );

  return { onDelete, onChange, onClick };
};
