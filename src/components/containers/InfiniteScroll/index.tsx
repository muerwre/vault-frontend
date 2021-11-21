import React, { FC, HTMLAttributes, useCallback, useEffect, useRef } from 'react';
import styles from './styles.module.scss';

interface IProps extends HTMLAttributes<HTMLDivElement> {
  hasMore: boolean;
  scrollReactPx?: number;
  loadMore: () => void;
}

const InfiniteScroll: FC<IProps> = ({ children, hasMore, scrollReactPx, loadMore, ...props }) => {
  const ref = useRef<HTMLDivElement>(null);
  const onScrollEnd = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (!hasMore || !entries[0].isIntersecting) return;
      loadMore();
    },
    [hasMore, loadMore]
  );

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(onScrollEnd, {
      root: null,
      rootMargin: '200px',
      threshold: 1.0,
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [onScrollEnd]);

  return (
    <div {...props}>
      {children}
      {hasMore && <div className={styles.more} ref={ref} />}
    </div>
  );
};

export { InfiniteScroll };
