import { useCallback, useEffect, useMemo, useState } from 'react';

export const useWindowSize = () => {
  const [size, setSize] = useState({ innerWidth: 0, innerHeight: 0 });

  const onResize = useCallback(
    () => setSize({ innerWidth: window.innerWidth, innerHeight: window.innerHeight }),
    []
  );

  useEffect(() => {
    onResize();

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  });

  return size;
};
