import { useCallback, useEffect } from 'react';

export const useInfiniteLoader = (loader: () => void, isLoading?: boolean) => {
  const onLoadMore = useCallback(() => {
    const pos = window.scrollY + window.innerHeight - document.body.scrollHeight;

    if (isLoading || pos < -600) return;

    loader();
  }, [loader, isLoading]);

  useEffect(() => {
    window.addEventListener('scroll', onLoadMore);

    return () => window.removeEventListener('scroll', onLoadMore);
  }, [onLoadMore]);
};
