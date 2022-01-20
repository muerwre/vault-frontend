import { useMemo } from 'react';

import { useFlowLayout } from '~/hooks/flow/useFlowLayout';
import { useFlowLoader } from '~/hooks/flow/useFlowLoader';
import { useFlowSetCellView } from '~/hooks/flow/useFlowSetCellView';
import { useGetLabStats } from '~/hooks/lab/useGetLabStats';
import { useFlowStore } from '~/store/flow/useFlowStore';
import { GetNodeDiffResult } from '~/types/node';

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
