import { useEffect } from 'react';

export const useResizeHandler = (onResize: () => any) => {
  useEffect(() => {
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, [onResize]);
};
