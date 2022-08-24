import React, { createElement, FC } from 'react';

import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import classNames from 'classnames';

import { DragOverlayItem } from '~/components/sortable/DragOverlayItem';
import { SortableItem } from '~/components/sortable/SortableItem';
import { useSortableActions } from '~/hooks/sortable/useSortableActions';

import styles from './styles.module.scss';

interface SortableListProps<
  RenderItemProps extends {},
  RenderLockedProps extends {},
  Item extends {},
  Locked extends {},
> {
  items: Item[];
  locked: Locked[];
  getID: (item: Item) => number | string;
  getLockedID: (locked: Locked) => number | string;
  renderItem: FC<RenderItemProps & { item: Item }>;
  renderItemProps: RenderItemProps;
  renderLocked: FC<RenderLockedProps & { locked: Locked }>;
  renderLockedProps: RenderLockedProps;
  onSortEnd: (newVal: Item[]) => void;
  className?: string;
}

const SortableList = <RIP, RLP, I, L>({
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
}: SortableListProps<RIP, RLP, I, L>) => {
  const { sensors, onDragEnd, onDragStart, draggingItem, ids } =
    useSortableActions(items, getID, onSortEnd);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className={classNames(styles.grid, className)}>
          {items.map((item) => (
            <SortableItem
              key={getID(item)}
              id={getID(item)}
              className={
                draggingItem && getID(item) === getID(draggingItem)
                  ? styles.dragging
                  : undefined
              }
            >
              {createElement(renderItem, {
                ...renderItemProps,
                item,
                key: getID(item),
              })}
            </SortableItem>
          ))}

          {locked.map((item) =>
            createElement(renderLocked, {
              ...renderLockedProps,
              locked: item,
              key: getLockedID(item),
            }),
          )}

          <DragOverlay>
            {draggingItem ? (
              <DragOverlayItem>
                {createElement(renderItem, {
                  ...renderItemProps,
                  item: draggingItem,
                })}
              </DragOverlayItem>
            ) : null}
          </DragOverlay>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export { SortableList };
