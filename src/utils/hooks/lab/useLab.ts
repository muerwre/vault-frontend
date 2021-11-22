import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import {
  selectLabList,
  selectLabStatsHeroes,
  selectLabStatsLoading,
  selectLabStatsTags,
  selectLabUpdatesNodes,
} from '~/redux/lab/selectors';
import { useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { labGetList, labGetMore, labGetStats } from '~/redux/lab/actions';

export const useLab = () => {
  const { is_loading: isLoading, nodes, count } = useShallowSelect(selectLabList);
  const dispatch = useDispatch();
  const tags = useShallowSelect(selectLabStatsTags);
  const heroes = useShallowSelect(selectLabStatsHeroes);
  const isLoadingStats = useShallowSelect(selectLabStatsLoading);
  const updates = useShallowSelect(selectLabUpdatesNodes);

  useEffect(() => {
    dispatch(labGetList());
    dispatch(labGetStats());
  }, [dispatch]);

  const onLoadMore = useCallback(() => {
    if (nodes.length >= count) {
      return;
    }

    dispatch(labGetMore());
  }, [nodes, count, dispatch]);

  return { isLoading, nodes, count, onLoadMore, tags, heroes, isLoadingStats, updates };
};
