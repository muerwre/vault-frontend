import { useCallback, useEffect, useState } from 'react';

export const useWindowSize = () => {
  const [size, setSize] = useState({ innerWidth: 0, innerHeight: 0, isMobile: false });

  const onResize = useCallback(
    () =>
      setSize({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        isMobile: window.innerWidth < 768,
      }),
    []
  );

  useEffect(() => {
    onResize();

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
};
