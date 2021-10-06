import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { useInfiniteLoader } from '~/utils/hooks/useInfiniteLoader';
import { labGetMore } from '~/redux/lab/actions';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectLabList } from '~/redux/lab/selectors';

export const useLabPagination = ({ isLoading }) => {
  const { nodes, count } = useShallowSelect(selectLabList);

  const dispatch = useDispatch();
  const loadMore = useCallback(() => {
    if (nodes.length >= count) {
      return;
    }

    dispatch(labGetMore());
  }, [nodes, count]);

  useInfiniteLoader(loadMore, isLoading);
};
