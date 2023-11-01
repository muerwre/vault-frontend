import { useCallback, useRef } from 'react';

import { CancelTokenSource } from 'axios';
import axios from 'axios';

import { apiLikeComment, apiLockComment, apiPostComment } from '~/api/node';
import { useGetComments } from '~/hooks/comments/useGetComments';
import { IComment } from '~/types';
import { showErrorToast } from '~/utils/errors/showToast';

const updateComment =
  (id: number, data: Partial<IComment>) => (pages?: IComment[][]) =>
    pages?.map((comments) =>
      comments.map((comment) =>
        comment.id === id ? { ...comment, ...data } : comment,
      ),
    );

const transformComment =
  (id: number, cb: (val: IComment) => IComment) => (pages?: IComment[][]) =>
    pages?.map((comments) =>
      comments.map((comment) => (comment.id === id ? cb(comment) : comment)),
    );

const insertComment = (data: IComment) => (pages?: IComment[][]) =>
  pages?.map((list, index) => (index === 0 ? [data, ...list] : list));

export const useNodeComments = (nodeId: number, fallbackData?: IComment[]) => {
  const likeAbortController = useRef<CancelTokenSource>();

  const {
    comments,
    isLoading,
    onLoadMoreComments,
    hasMore,
    data,
    mutate,
    isLoadingMore,
  } = useGetComments(nodeId, fallbackData);

  const onDelete = useCallback(
    async (id: number, isLocked: boolean) => {
      try {
        const { deleted_at } = await apiLockComment({ id, nodeId, isLocked });

        if (!data) {
          return;
        }

        await mutate(updateComment(id, { deleted_at }), false);
      } catch (error) {
        showErrorToast(error);
      }
    },
    [data, mutate, nodeId],
  );

  const onEdit = useCallback(
    async (comment: IComment) => {
      const result = await apiPostComment({ id: nodeId, data: comment });

      if (!data) {
        return;
      }

      // Comment was created
      if (!comment.id) {
        await mutate(insertComment(result.comment), false);
      } else {
        await mutate(updateComment(comment.id, result.comment), false);
      }

      return result.comment;
    },
    [data, mutate, nodeId],
  );

  const sendLikeRequest = useCallback(
    async (id: number, liked: boolean) => {
      if (likeAbortController.current) {
        likeAbortController.current.cancel();
      }

      likeAbortController.current = axios.CancelToken.source();

      await apiLikeComment(
        nodeId,
        id,
        { liked },
        { cancelToken: likeAbortController.current?.token },
      );

      likeAbortController.current = undefined;
    },
    [nodeId],
  );

  const onLike = useCallback(
    async (id: number, liked: boolean) => {
      const increment = liked ? 1 : -1;
      await mutate(
        transformComment(id, (val) => ({
          ...val,
          liked,
          like_count: (val.like_count ?? 0) + increment,
        })),
        false,
      );

      sendLikeRequest(id, liked).catch(showErrorToast);
    },
    [mutate, sendLikeRequest],
  );

  return {
    onLoadMoreComments,
    onDelete,
    onLike,
    comments,
    hasMore,
    isLoading,
    onEdit,
    isLoadingMore,
  };
};
