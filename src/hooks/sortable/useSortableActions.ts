import { useCallback, useMemo, useState } from 'react';

import { DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { DragEndEvent } from '@dnd-kit/core/dist/types';

import { moveArrItem } from '~/utils/fn';

export const useSortableActions = <T>(
  items: T[],
  getID: (item: T) => string | number,
  onSortEnd: (items: T[]) => void
) => {
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

  return { sensors, onDragEnd, onDragStart, draggingItem, ids };
};
