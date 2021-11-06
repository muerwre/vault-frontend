import { useCallback } from 'react';
import { flowChangeSearch, flowLoadMoreSearch } from '~/redux/flow/actions';
import { useDispatch } from 'react-redux';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectFlow } from '~/redux/flow/selectors';

export const useSearch = () => {
  const dispatch = useDispatch();
  const { search } = useShallowSelect(selectFlow);

  const onSearchLoadMore = useCallback(() => {
    if (search.is_loading_more) return;
    dispatch(flowLoadMoreSearch());
  }, [search.is_loading_more, dispatch]);

  const onSearchChange = useCallback(
    (text: string) => {
      dispatch(flowChangeSearch({ text }));
    },
    [dispatch]
  );

  return { onSearchChange, onSearchLoadMore, search };
};
