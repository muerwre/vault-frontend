import { useCallback } from 'react';
import { FlowDisplay, INode } from '~/types';

export const useFlowCellControls = (
  id: INode['id'],
  description: string | undefined,
  flow: FlowDisplay,
  onChangeCellView: (id: INode['id'], flow: FlowDisplay) => void
) => {
  const onChange = useCallback(
    (value: Partial<FlowDisplay>) => onChangeCellView(id, { ...flow, ...value }),
    [flow, id, onChangeCellView]
  );

  const hasDescription = !!description && description.length > 32;

  const toggleViewDescription = useCallback(() => {
    const show_description = !(flow && flow.show_description);
    onChange({ show_description });
  }, [flow, onChange]);

  const setViewSingle = useCallback(() => {
    onChange({ display: 'single' });
  }, [onChange]);

  const setViewHorizontal = useCallback(() => {
    onChange({ display: 'horizontal' });
  }, [onChange]);

  const setViewVertical = useCallback(() => {
    onChange({ display: 'vertical' });
  }, [onChange]);

  const setViewQuadro = useCallback(() => {
    onChange({ display: 'quadro' });
  }, [onChange]);

  return {
    hasDescription,
    setViewHorizontal,
    setViewVertical,
    setViewQuadro,
    setViewSingle,
    toggleViewDescription,
  };
};
