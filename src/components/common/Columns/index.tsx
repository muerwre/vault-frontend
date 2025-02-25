import { FC, useEffect, useRef, useState } from 'react';

import Masonry from 'react-masonry-css';

import { useScrollEnd } from '~/hooks/dom/useScrollEnd';

import styles from './styles.module.scss';

const defaultColumns = {
  default: 2,
  840: 1,
};

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
  const [columns, setColumns] = useState<Element[]>([]);

  useEffect(() => {
    const childs = ref.current?.querySelectorAll(`.${styles.column}`);

    if (!childs) return;

    const timeout = setTimeout(() => setColumns([...childs.values()]), 150);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current]);

  useScrollEnd(columns, onScrollEnd, { active: hasMore, threshold: 2 });

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
