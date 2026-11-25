import { FC, useEffect, useRef } from 'react';

import Masonry from 'react-masonry-css';
import { throttle } from 'throttle-debounce';

import styles from './styles.module.scss';

const defaultColumns = {
  default: 2,
  840: 1,
};

/** Load more once the shortest column ends within this many viewports */
const SCROLL_END_THRESHOLD = 2;

interface ColumnsProps {
  cols?: Record<number, number>;
  onScrollEnd?: () => void;
  hasMore?: boolean;
}

const Columns: FC<ColumnsProps> = ({
  children,
  cols = defaultColumns,
  onScrollEnd,
  hasMore,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Masonry deals cards round-robin, so columns end up of different heights.
  // Loading is driven by the shortest column, re-measured on scroll and
  // whenever any column resizes (images loading, new cards, breakpoints).
  useEffect(() => {
    const wrap = ref.current;

    if (!wrap || !hasMore || !onScrollEnd) return;

    const check = throttle(300, () => {
      const columns = wrap.querySelectorAll(`.${styles.column}`);

      if (!columns.length) return;

      const shortest = Math.min(
        ...Array.from(columns, (it) => it.getBoundingClientRect().bottom),
      );

      if (shortest < window.innerHeight * SCROLL_END_THRESHOLD) {
        onScrollEnd();
      }
    });

    const columnObserver = new ResizeObserver(check);
    let observed: Element[] = [];

    // Masonry may replace column elements when the column count changes
    const bindColumns = () => {
      const next = Array.from(wrap.querySelectorAll(`.${styles.column}`));

      if (
        next.length === observed.length &&
        next.every((it, i) => it === observed[i])
      ) {
        return;
      }

      columnObserver.disconnect();
      next.forEach((it) => columnObserver.observe(it));
      observed = next;
    };

    const wrapObserver = new ResizeObserver(() => {
      bindColumns();
      check();
    });

    wrapObserver.observe(wrap);
    bindColumns();
    window.addEventListener('scroll', check, { passive: true });

    return () => {
      check.cancel();
      wrapObserver.disconnect();
      columnObserver.disconnect();
      window.removeEventListener('scroll', check);
    };
  }, [hasMore, onScrollEnd]);

  return (
    <div ref={ref}>
      <Masonry
        className={styles.wrap}
        breakpointCols={cols}
        columnClassName={styles.column}
      >
        {children}
      </Masonry>
    </div>
  );
};

export { Columns };
