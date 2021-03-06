import { useEffect } from 'react';

export const useScrollToTop = (deps?: any[]) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, deps || []);
};
