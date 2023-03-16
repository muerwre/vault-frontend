import { useEffect, useRef } from 'react';

export const useFormAutoSubmit = <T>(
  values: T,
  onSubmit: () => void,
  delay = 1000,
) => {
  const prevValue = useRef<T>();

  useEffect(() => {
    if (!prevValue.current) {
      prevValue.current = values;
      return;
    }

    const timeout = setTimeout(onSubmit, delay);

    return () => clearTimeout(timeout);
  }, [values]);
};
