import { useCallback } from 'react';
import { useScrollHeight } from '~/hooks/dom/useScrollHeight';

export const useScrollToBottom = () => {
  const top = useScrollHeight();

  return useCallback(() => {
    window.scrollTo({ top });
  }, [top]);
};
