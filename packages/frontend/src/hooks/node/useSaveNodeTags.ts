import { useCallback } from 'react';

import { apiDeleteNodeTag, apiPostNodeTags } from '~/api/node';
import { ITag } from '~/types';

/**
 * Brings a saved node's tags to the given set. Sending titles replaces the
 * whole set, matching or creating each; an empty list is ignored there, so
 * clearing every tag deletes them one by one.
 */
export const useSaveNodeTags = () =>
  useCallback(async (id: number, before: ITag[], after: ITag[]) => {
    const titles = after.map((it) => it.title.trim()).filter(Boolean);
    const unchanged =
      titles.length === before.length &&
      titles.every((title) => before.some((it) => it.title === title));

    if (unchanged) {
      return;
    }

    if (titles.length) {
      await apiPostNodeTags({ id, tags: titles });
      return;
    }

    await Promise.all(
      before.map((tag) => apiDeleteNodeTag({ id, tagId: tag.ID })),
    );
  }, []);
