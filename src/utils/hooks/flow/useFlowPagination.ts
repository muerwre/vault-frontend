import { useCallback, useEffect } from 'react';
import { flowGetMore } from '~/redux/flow/actions';
import { useDispatch } from 'react-redux';
import { useInfiniteLoader } from '~/utils/hooks/useInfiniteLoader';

export const useFlowPagination = ({ isLoading }) => {
  const dispatch = useDispatch();
  const loadMore = useCallback(() => dispatch(flowGetMore()), []);
  useInfiniteLoader(loadMore, isLoading);
};
