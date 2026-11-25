import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { Masonry, RenderComponentProps, useInfiniteLoader } from 'masonic';

import { useWindowSize } from '~/hooks/dom/useWindowSize';

/**
 * Column count by window width: each key is the widest window it applies to,
 * `default` is for anything wider.
 */
export type MasonryGridColumns = {
  default: number;
  [maxWidth: number]: number;
};

const defaultColumns: MasonryGridColumns = { default: 2, 840: 1 };

/** Gap between cards, both ways, in pixels; matches `$gap` */
const DEFAULT_GAP = 8;

/** Load the next page this many cards before the last one gets rendered */
const LOAD_THRESHOLD = 4;

interface Props<T> {
  items: T[];
  itemKey: (item: T) => string | number;
  render: (item: T, index: number) => ReactNode;
  cols?: MasonryGridColumns;
  gap?: number;
  /** Rough card height, used before cards are measured */
  itemHeightEstimate?: number;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

const getColumnCount = (cols: MasonryGridColumns, width: number) => {
  const breakpoint = Object.keys(cols)
    .filter((it) => it !== 'default')
    .map(Number)
    .sort((a, b) => a - b)
    .find((it) => width <= it);

  return breakpoint === undefined ? cols.default : cols[breakpoint];
};

/**
 * Masonic only appends: removing or reordering items breaks its cached
 * positions, so the grid gets a new key whenever the list is not just a
 * continuation of the previous one.
 */
const useLayoutKey = (keys: (string | number)[]) => {
  const prev = useRef<(string | number)[]>([]);
  const layoutKey = useRef(0);

  const isContinuation =
    keys.length >= prev.current.length &&
    prev.current.every((it, i) => it === keys[i]);

  if (!isContinuation) layoutKey.current += 1;
  prev.current = keys;

  return layoutKey.current;
};

// Masonic remounts every cell when its render component changes, so the cell
// is a stable component and gets the current render function through context
const RenderContext = createContext<(item: any, index: number) => ReactNode>(
  () => null,
);

const Cell = ({ data, index }: RenderComponentProps<unknown>) => {
  const render = useContext(RenderContext);
  return <>{render(data, index)}</>;
};

/**
 * Masonry that puts every card into the shortest column, so columns stay
 * level, and asks for more when the shortest column is about to end.
 * Cards far off screen are not rendered.
 */
function MasonryGrid<T>({
  items,
  itemKey,
  render,
  cols = defaultColumns,
  gap = DEFAULT_GAP,
  itemHeightEstimate,
  hasMore,
  onLoadMore,
  className,
}: Props<T>) {
  const { innerWidth } = useWindowSize();

  const keys = useMemo(() => items.map(itemKey), [items, itemKey]);
  const layoutKey = useLayoutKey(keys);

  const loadMore = useInfiniteLoader<T, () => void>(
    () => {
      if (hasMore) onLoadMore?.();
    },
    {
      threshold: LOAD_THRESHOLD,
      totalItems: hasMore ? undefined : items.length,
    },
  );

  // Masonic reports rendered cards only when that range changes, so the last
  // one is checked again when loading becomes possible
  const lastRange = useRef<[number, number]>();

  const onRender = useCallback(
    (startIndex: number, stopIndex: number, rendered: T[]) => {
      lastRange.current = [startIndex, stopIndex];
      loadMore(startIndex, stopIndex, rendered);
    },
    [loadMore],
  );

  useEffect(() => {
    if (hasMore && lastRange.current) {
      loadMore(...lastRange.current, items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore]);

  // Window size is unknown until mounted, and masonic needs the window anyway
  if (!innerWidth) return null;

  return (
    <RenderContext.Provider value={render}>
      <Masonry<T>
        key={layoutKey}
        className={className}
        items={items}
        itemKey={itemKey}
        render={Cell}
        columnCount={getColumnCount(cols, innerWidth)}
        columnGutter={gap}
        rowGutter={gap}
        itemHeightEstimate={itemHeightEstimate}
        onRender={onRender}
      />
    </RenderContext.Provider>
  );
}

export { MasonryGrid };
