import { useCallback } from 'react';
import { FlowDisplay, INode } from '~/redux/types';

export const useFlowCellControls = (
  id: INode['id'],
  description: string | undefined,
  flow: FlowDisplay,
  onChangeCellView: (id: INode['id'], flow: FlowDisplay) => void
) => {
  const onChange = useCallback(
    (value: Partial<FlowDisplay>) => onChangeCellView(id, { ...flow, ...value }),
    []
  );

  const hasDescription = !!description && description.length > 32;

  const toggleViewDescription = useCallback(() => {
    const show_description = !(flow && flow.show_description);
    onChange({ show_description });
  }, [id, flow, onChange]);

  const setViewSingle = useCallback(() => {
    onChange({ display: 'single' });
  }, [id, flow, onChange]);

  const setViewHorizontal = useCallback(() => {
    onChange({ display: 'horizontal' });
  }, [id, flow, onChange]);

  const setViewVertical = useCallback(() => {
    onChange({ display: 'vertical' });
  }, [id, flow]);

  const setViewQuadro = useCallback(() => {
    onChange({ display: 'quadro' });
  }, [id, flow, onChange]);

  return {
    hasDescription,
    setViewHorizontal,
    setViewVertical,
    setViewQuadro,
    setViewSingle,
    toggleViewDescription,
  };
};
