import { useMemo } from 'react';

export const useWindowSize = () =>
  useMemo(() => {
    if (typeof window === 'undefined') {
      return { innerWidth: 0, innerHeight: 0 };
    }

    return { innerWidth: window.innerWidth, innerHeight: window.innerHeight };
  }, []);
