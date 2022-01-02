import { useCallback } from 'react';
import { flowGetMore } from '~/redux/flow/actions';
import { useDispatch } from 'react-redux';
import { useInfiniteLoader } from '~/hooks/dom/useInfiniteLoader';

export const useFlowPagination = ({ isLoading }) => {
  const dispatch = useDispatch();
  const loadMore = useCallback(() => dispatch(flowGetMore()), [dispatch]);
  useInfiniteLoader(loadMore, isLoading);
};
