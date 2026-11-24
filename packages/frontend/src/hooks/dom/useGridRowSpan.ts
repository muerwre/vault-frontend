import { useEffect, useState } from 'react';

interface Elements {
  /** The grid the item sits in: its rows and gap are read from it. */
  grid: HTMLElement | null;
  /** The item's content at its natural height. */
  content: HTMLElement | null;
  /**
   * A content-sized row the item starts beside, such as a controls bar. It
   * is counted in only while its top is the item's: on a layout that puts
   * it above the item instead, it is left out.
   */
  header?: HTMLElement | null;
  /** Grid item whose top is compared with the header's. */
  item?: HTMLElement | null;
}

const px = (value: string) => parseFloat(value) || 0;

/**
 * One row's height. `grid-auto-rows` may come back as written, a `calc()`
 * rather than pixels; the laid-out tracks of `grid-template-rows` are
 * always pixels, the last of them being an auto row.
 */
const rowHeight = (style: CSSStyleDeclaration): number => {
  if (/^[\d.]+px$/.test(style.gridAutoRows)) {
    return px(style.gridAutoRows);
  }

  const tracks = style.gridTemplateRows.split(' ').filter(Boolean);

  return px(tracks[tracks.length - 1] ?? '');
};

/**
 * How many rows of a grid with fixed-height rows an item needs to fit its
 * content, never fewer than `min`. Follows the content, the grid's row size
 * and the header as any of them resizes.
 */
export const useGridRowSpan = (
  { grid, content, header, item }: Elements,
  min: number,
): number => {
  const [span, setSpan] = useState(min);

  useEffect(() => {
    if (!grid || !content) {
      setSpan(min);
      return;
    }

    const measure = () => {
      const style = getComputedStyle(grid);
      const row = rowHeight(style);
      const gap = px(style.rowGap);

      if (!row) {
        setSpan(min);
        return;
      }

      const beside =
        !!header && !!item && Math.abs(header.offsetTop - item.offsetTop) < 1;
      const height =
        content.scrollHeight - (beside ? header!.offsetHeight + gap : 0);
      const rows = Math.ceil((height + gap) / (row + gap));

      setSpan(Math.max(min, rows + (beside ? 1 : 0)));
    };

    measure();

    const observer = new ResizeObserver(measure);
    [grid, content, header].forEach((it) => it && observer.observe(it));

    return () => observer.disconnect();
  }, [grid, content, header, item, min]);

  return span;
};
