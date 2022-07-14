import React, { createElement, FC, useMemo } from 'react';

import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import classNames from 'classnames';

import { DragOverlayItem } from '~/components/sortable/DragOverlayItem';
import { useSortableActions } from '~/hooks/sortable';
import { DivProps } from '~/utils/types';

import { SortableItem } from '../SortableItem';

import styles from './styles.module.scss';

interface SortableGridProps<
  ItemRendererProps extends {},
  LockedRendererProps extends {},
  Item extends {},
  Locked extends {}
> {
  items: Item[];
  locked: Locked[];
  getID: (item: Item) => number | string;
  getLockedID: (locked: Locked) => number | string;
  renderItem: FC<ItemRendererProps & { item: Item }>;
  renderItemProps: ItemRendererProps;
  renderLocked: FC<LockedRendererProps & { locked: Locked }>;
  renderLockedProps: LockedRendererProps;
  onSortEnd: (newVal: Item[]) => void;
  className?: string;
  size?: number;
}

const SortableGrid = <RIP, RLP, I, L>({
  items,
  locked,
  getID,
  getLockedID,
  className,
  renderItem,
  renderItemProps,
  renderLocked,
  renderLockedProps,
  onSortEnd,
  size,
}: SortableGridProps<RIP, RLP, I, L>) => {
  const { sensors, onDragEnd, onDragStart, draggingItem, ids } = useSortableActions(
    items,
    getID,
    onSortEnd
  );

  const gridStyle = useMemo<DivProps['style']>(
    () =>
      size
        ? { gridTemplateColumns: size && `repeat(auto-fill, minmax(${size}px, 1fr))` }
        : undefined,
    [size]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className={classNames(styles.grid, className)} style={gridStyle}>
          {items.map(item => (
            <SortableItem
              key={getID(item)}
              id={getID(item)}
              className={
                draggingItem && getID(item) === getID(draggingItem) ? styles.dragging : undefined
              }
            >
              {createElement(renderItem, { ...renderItemProps, item })}
            </SortableItem>
          ))}

          {locked.map(item =>
            createElement(renderLocked, {
              ...renderLockedProps,
              locked: item,
              key: getLockedID(item),
            })
          )}

          <DragOverlay>
            {draggingItem ? (
              <DragOverlayItem>
                {createElement(renderItem, { ...renderItemProps, item: draggingItem })}
              </DragOverlayItem>
            ) : null}
          </DragOverlay>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export { SortableGrid };
