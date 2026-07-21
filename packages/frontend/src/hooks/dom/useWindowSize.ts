import { useCallback, useEffect, useState } from 'react';

export const useWindowSize = () => {
  const [size, setSize] = useState({
    innerWidth: 0,
    innerHeight: 0,
    isTablet: false,
    isPhone: false,
  });

  const onResize = useCallback(
    () =>
      setSize({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        isTablet: window.innerWidth < 768,
        isPhone: window.innerWidth < 500,
      }),
    [],
  );

  useEffect(() => {
    onResize();

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return size;
};
