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
  const [draggingItem, setDraggingItem] = useState<T | null>(null);

  const ids = useMemo(() => items.map(getID), [items]);

  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setDraggingItem(null);

      if (!over?.id || active.id === over.id) {
        return;
      }

      const oldIndex = items.findIndex(it => getID(it) === active.id);
      const newIndex = items.findIndex(it => getID(it) === over.id);

      onSortEnd(moveArrItem(oldIndex, newIndex, items));
    },
    [items]
  );

  const onDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      if (!active.id) {
        return;
      }

      const activeItem = items.find(it => getID(it) === active.id);

      setDraggingItem(activeItem ?? null);
    },
    [items]
  );

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor)
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
              <div className={styles.overlay}>
                {createElement(renderItem, { item: draggingItem })}
              </div>
            ) : null}
          </DragOverlay>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export { SortableGrid };
