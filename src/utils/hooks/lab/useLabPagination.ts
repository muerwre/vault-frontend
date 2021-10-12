import { useCallback, useEffect, useMemo } from 'react';

export const useLabPagination = (
  isLoading: boolean,
  columns: Element[],
  onLoadMore: () => void
) => {
  const loadOnIntersection = useCallback<IntersectionObserverCallback>(
    entries => {
      const isVisible = entries.some(entry => entry.intersectionRatio > 0);

      if (!isVisible) {
        return;
      }

      onLoadMore();
    },
    [onLoadMore]
  );

  const observer = useMemo(
    () =>
      new IntersectionObserver(loadOnIntersection, {
        threshold: [0],
      }),
    [loadOnIntersection]
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const lastItems = Array.from(columns)
      .map(col => col.children.item(col.childNodes.length - 1))
      .filter(el => el) as Element[];

    lastItems.forEach(item => observer.observe(item));

    return () => {
      lastItems.forEach(item => observer.unobserve(item));
    };
  }, [observer, columns]);
};
