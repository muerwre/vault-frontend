import { useCallback } from 'react';

export const useConfirmation = () =>
  useCallback((prompt = '', onApprove: () => {}, onReject?: () => {}) => {
    if (!window.confirm(prompt || 'Уверен?')) {
      onReject?.();
      return;
    }

    onApprove();
  }, []);
