import React, { createElement, FC, useCallback, useMemo, useState } from 'react';

import {
  closestCenter,
  DndContext,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { DragEndEvent } from '@dnd-kit/core/dist/types';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import classNames from 'classnames';

import { DragOverlayItem } from '~/components/sortable/DragOverlayItem';
import { useSortableActions } from '~/hooks/sortable';
import { moveArrItem } from '~/utils/fn';
import { DivProps } from '~/utils/types';

import { SortableImageGridItem } from '../SortableGridItem';

import styles from './styles.module.scss';

interface SortableGridProps<T extends {}, R extends {}> {
  items: T[];
  locked: R[];
  getID: (item: T) => number | string;
  getLockedID: (locked: R) => number | string;
  renderItem: FC<{ item: T }>;
  renderLocked: FC<{ locked: R }>;
  onSortEnd: (newVal: T[]) => void;
  className?: string;
  size?: number;
}

const SortableGrid = <T, R>({
  items,
  locked,
  getID,
  getLockedID,
  className,
  renderItem,
  renderLocked,
  onSortEnd,
  size,
}: SortableGridProps<T, R>) => {
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
            <SortableImageGridItem
              key={getID(item)}
              id={getID(item)}
              className={
                draggingItem && getID(item) === getID(draggingItem) ? styles.dragging : undefined
              }
            >
              {createElement(renderItem, { item })}
            </SortableImageGridItem>
          ))}

          {locked.map(item =>
            createElement(renderLocked, { locked: item, key: getLockedID(item) })
          )}

          <DragOverlay>
            {draggingItem ? (
              <DragOverlayItem>{createElement(renderItem, { item: draggingItem })}</DragOverlayItem>
            ) : null}
          </DragOverlay>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export { SortableGrid };
