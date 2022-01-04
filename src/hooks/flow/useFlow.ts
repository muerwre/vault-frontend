import { useShallowSelect } from '~/hooks/data/useShallowSelect';
import { useFlowLayout } from '~/hooks/flow/useFlowLayout';
import { selectLabUpdatesNodes } from '~/redux/lab/selectors';
import { useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { FlowDisplay, INode } from '~/redux/types';
import { flowSetCellView } from '~/redux/flow/actions';
import { useFlowLoader } from '~/hooks/flow/useFlowLoader';
import { useFlowStore } from '~/store/flow/useFlowStore';
import { useInfiniteLoader } from '~/hooks/dom/useInfiniteLoader';

export const useFlow = () => {
  const { loadMore, isSyncing } = useFlowLoader();

  const { nodes, heroes, recent, updated } = useFlowStore();
  const { isFluid, toggleLayout } = useFlowLayout();
  const labUpdates = useShallowSelect(selectLabUpdatesNodes);
  const dispatch = useDispatch();

  useInfiniteLoader(loadMore, isSyncing);

  const updates = useMemo(() => [...updated, ...labUpdates].slice(0, 10), [updated, labUpdates]);

  const onChangeCellView = useCallback(
    (id: INode['id'], val: FlowDisplay) => dispatch(flowSetCellView(id, val)),
    [dispatch]
  );

  return { nodes, heroes, recent, updates, isFluid, toggleLayout, onChangeCellView };
};
