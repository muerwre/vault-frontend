import { useShallowSelect } from '~/hooks/data/useShallowSelect';
import { useFlowLayout } from '~/hooks/flow/useFlowLayout';
import { selectLabUpdatesNodes } from '~/redux/lab/selectors';
import { useMemo } from 'react';
import { useFlowLoader } from '~/hooks/flow/useFlowLoader';
import { useFlowStore } from '~/store/flow/useFlowStore';
import { useInfiniteLoader } from '~/hooks/dom/useInfiniteLoader';
import { useFlowSetCellView } from '~/hooks/flow/useFlowSetCellView';

export const useFlow = () => {
  const { loadMore, isSyncing } = useFlowLoader();

  const { nodes, heroes, recent, updated } = useFlowStore();
  const { isFluid, toggleLayout } = useFlowLayout();
  const labUpdates = useShallowSelect(selectLabUpdatesNodes);

  useInfiniteLoader(loadMore, isSyncing);

  const updates = useMemo(() => [...updated, ...labUpdates].slice(0, 10), [updated, labUpdates]);

  const onChangeCellView = useFlowSetCellView();
  return { nodes, heroes, recent, updates, isFluid, toggleLayout, onChangeCellView };
};
