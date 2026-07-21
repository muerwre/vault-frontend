import { ForwardedRef, useEffect, useRef } from 'react';

export const useForwardRef = <T>(ref: ForwardedRef<T | null>) => {
  const targetRef = useRef<T | null>(null);

  useEffect(() => {
    if (!ref) return;

    if (typeof ref === 'function') {
      (ref as any)(targetRef.current);
    } else {
      (ref as any).current = targetRef.current;
    }
  }, [ref]);

  return targetRef;
};
