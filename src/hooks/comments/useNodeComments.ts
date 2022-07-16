import { useCallback } from 'react';

import { apiLockComment, apiPostComment } from '~/api/node';
import { useGetComments } from '~/hooks/comments/useGetComments';
import { IComment } from '~/types';
import { showErrorToast } from '~/utils/errors/showToast';

export const useNodeComments = (nodeId: number, fallbackData?: IComment[]) => {
  const { comments, isLoading, onLoadMoreComments, hasMore, data, mutate } = useGetComments(
    nodeId,
    fallbackData
  );

  const onDelete = useCallback(
    async (id: IComment['id'], isLocked: boolean) => {
      try {
        const { deleted_at } = await apiLockComment({ id, nodeId, isLocked });

        if (!data) {
          return;
        }

        await mutate(
          prev =>
            prev?.map(list =>
              list.map(comment => (comment.id === id ? { ...comment, deleted_at } : comment))
            ),
          false
        );
      } catch (error) {
        showErrorToast(error);
      }
    },
    [data, mutate, nodeId]
  );

  const onEdit = useCallback(
    async (comment: IComment) => {
      const result = await apiPostComment({ id: nodeId, data: comment });

      if (!data) {
        return;
      }

      // Comment was created
      if (!comment.id) {
        await mutate(
          data.map((list, index) => (index === 0 ? [result.comment, ...list] : list)),
          false
        );
        return;
      }

      await mutate(
        prev =>
          prev?.map(list =>
            list.map(it => (it.id === result.comment.id ? { ...it, ...result.comment } : it))
          ),
        false
      );
    },
    [data, mutate, nodeId]
  );

  return { onLoadMoreComments, onDelete, comments, hasMore, isLoading, onEdit };
};
