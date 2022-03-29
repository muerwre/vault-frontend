import { useEffect, useState } from 'react';

export const useDebouncedValue = <T>(val: T, delay = 300) => {
  const [state, setState] = useState<T>(val);

  useEffect(() => {
    const timeout = setTimeout(() => setState(val), delay);
    return () => clearTimeout(timeout);
  }, [val, delay]);

  return state;
};
