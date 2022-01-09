import { useFlowLayout } from '~/hooks/flow/useFlowLayout';
import { useMemo } from 'react';
import { useFlowLoader } from '~/hooks/flow/useFlowLoader';
import { useFlowStore } from '~/store/flow/useFlowStore';
import { useFlowSetCellView } from '~/hooks/flow/useFlowSetCellView';
import { useGetLabStats } from '~/hooks/lab/useGetLabStats';

export const useFlow = () => {
  const { loadMore, isSyncing } = useFlowLoader();

  const { nodes, heroes, recent, updated } = useFlowStore();
  const { isFluid, toggleLayout } = useFlowLayout();
  const lab = useGetLabStats();

  const updates = useMemo(() => [...updated, ...lab.updates].slice(0, 10), [lab.updates, updated]);

  const onChangeCellView = useFlowSetCellView();

  return {
    nodes,
    heroes,
    recent,
    updates,
    isFluid,
    toggleLayout,
    onChangeCellView,
    loadMore,
    isSyncing,
  };
};
