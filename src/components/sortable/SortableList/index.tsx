import React, { createElement, FC } from 'react';

import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import classNames from 'classnames';

import { DragOverlayItem } from '~/components/sortable/DragOverlayItem';
import { SortableItem } from '~/components/sortable/SortableItem';
import { useSortableActions } from '~/hooks/sortable';

import styles from './styles.module.scss';

interface SortableListProps<T extends {}, R extends {}> {
  items: T[];
  locked: R[];
  getID: (item: T) => number | string;
  getLockedID: (locked: R) => number | string;
  renderItem: FC<{ item: T }>;
  renderLocked: FC<{ locked: R }>;
  onSortEnd: (newVal: T[]) => void;
  className?: string;
}

const SortableList = <T, R>({
  items,
  locked,
  getID,
  getLockedID,
  className,
  renderItem,
  renderLocked,
  onSortEnd,
}: SortableListProps<T, R>) => {
  const { sensors, onDragEnd, onDragStart, draggingItem, ids } = useSortableActions(
    items,
    getID,
    onSortEnd
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className={classNames(styles.grid, className)}>
          {items.map(item => (
            <SortableItem
              key={getID(item)}
              id={getID(item)}
              className={
                draggingItem && getID(item) === getID(draggingItem) ? styles.dragging : undefined
              }
            >
              {createElement(renderItem, { item })}
            </SortableItem>
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

export { SortableList };
