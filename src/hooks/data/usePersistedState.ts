import { useEffect, useMemo, useState } from 'react';

export const usePersistedState = (key: string, initial: string): [string, (val: string) => any] => {
  const stored = useMemo(() => {
    try {
      return localStorage.getItem(`vault_${key}`) || initial;
    } catch (e) {
      return initial;
    }
  }, [key]);

  const [val, setVal] = useState<string>(stored);

  useEffect(() => {
    localStorage.setItem(`vault_${key}`, val);
  }, [val]);

  return [val, setVal];
};
