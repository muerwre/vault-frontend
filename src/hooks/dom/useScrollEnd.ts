import { useCallback, useEffect, useMemo } from 'react';

import { throttle } from 'throttle-debounce';

import { useWindowSize } from './useWindowSize';

interface Options {
  active?: boolean;
  threshold?: number;
}

export const useScrollEnd = (
  item: Element | Element[] | undefined | null,
  callback?: () => void,
  { active = true, threshold = 1.5 }: Options = {},
) => {
  const debouncedCallback = useMemo(
    () => callback && throttle(1000, callback),
    [callback],
  );

  const { innerHeight } = useWindowSize();

  useEffect(() => {
    if (!item || !active || !debouncedCallback) return;

    const items = Array.isArray(item) ? item : [item];
    const positions = items.map((it) => {
      const { top, height } = it.getBoundingClientRect();
      return top + window.scrollY + height;
    });

    const eventHandler = () => {
      if (
        !positions.some(
          (it) => it < window.scrollY + window.innerHeight * threshold,
        )
      )
        return;

      debouncedCallback();
    };

    window.addEventListener('scroll', eventHandler);

    return () => window.removeEventListener('scroll', eventHandler);
  }, [item, active, innerHeight, debouncedCallback]);
};
