import { useShallowSelect } from '~/hooks/data/useShallowSelect';
import { selectFlow } from '~/redux/flow/selectors';
import { useFlowLayout } from '~/hooks/flow/useFlowLayout';
import { selectLabUpdatesNodes } from '~/redux/lab/selectors';
import { useDispatch } from 'react-redux';
import { useFlowPagination } from '~/hooks/flow/useFlowPagination';
import { useCallback, useMemo } from 'react';
import { FlowDisplay, INode } from '~/redux/types';
import { flowSetCellView } from '~/redux/flow/actions';

export const useFlow = () => {
  const { nodes, heroes, recent, updated, isLoading } = useShallowSelect(selectFlow);
  const { isFluid, toggleLayout } = useFlowLayout();
  const labUpdates = useShallowSelect(selectLabUpdatesNodes);
  const dispatch = useDispatch();

  useFlowPagination({ isLoading });

  const updates = useMemo(() => [...updated, ...labUpdates].slice(0, 10), [updated, labUpdates]);

  const onChangeCellView = useCallback(
    (id: INode['id'], val: FlowDisplay) => dispatch(flowSetCellView(id, val)),
    [dispatch]
  );

  return { nodes, heroes, recent, updates, isFluid, toggleLayout, onChangeCellView };
};
