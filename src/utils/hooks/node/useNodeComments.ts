import { IComment, IFile, INode } from '~/redux/types';
import useSWRInfinite from 'swr/infinite';
import { ApiGetNodeCommentsResponse } from '~/redux/node/api';
import { api, cleanResult } from '~/utils/api';
import { API } from '~/constants/api';
import { useCallback, useMemo } from 'react';
import { COMMENTS_DISPLAY } from '~/redux/node/constants';
import { nodeLockComment } from '~/redux/node/actions';
import { useDispatch } from 'react-redux';
import { modalShowPhotoswipe } from '~/redux/modal/actions';

export const fetcher = (url: string) => api.get<ApiGetNodeCommentsResponse>(url).then(cleanResult);

export const useNodeComments = (id: INode['id']) => {
  const dispatch = useDispatch();

  const getKey = useCallback(
    (pageIndex, previousPageData) => {
      if (previousPageData && !previousPageData?.comments?.length) return null;
      return API.NODE.COMMENT_INFINITE(id, pageIndex * COMMENTS_DISPLAY);
    },
    [id]
  );

  const { data, error, isValidating, size, setSize } = useSWRInfinite(getKey, fetcher);

  const comments = useMemo<IComment[]>(
    () => (data || []).reduce((acc, { comments }) => [...acc, ...comments], [] as IComment[]),
    [data]
  );

  const count = useMemo<number>(() => {
    if (!data) {
      return 0;
    }

    return data[data.length - 1].comment_count || 0;
  }, [data]);

  const isLoading = !data && !isValidating;

  const onDelete = useCallback(
    (id: IComment['id'], locked: boolean) => dispatch(nodeLockComment(id, locked)),
    [dispatch]
  );
  const onLoadMoreComments = useCallback(() => setSize(size + 1), [size, setSize]);

  const onShowPhotoswipe = useCallback(
    (images: IFile[], index: number) => dispatch(modalShowPhotoswipe(images, index)),
    [dispatch]
  );

  return { comments, count, error, isLoading, onDelete, onLoadMoreComments, onShowPhotoswipe };
};
