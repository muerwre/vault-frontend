import React, { FC, useCallback, useMemo, useState } from 'react';

import {
  closestCenter,
  DndContext,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { DragEndEvent } from '@dnd-kit/core/dist/types';
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import classNames from 'classnames';

import { SortableImageGridItem } from '~/components/editors/SortableImageGridItem';
import { ImageUpload } from '~/components/upload/ImageUpload';
import { ImagePresets } from '~/constants/urls';
import { UploadStatus } from '~/store/uploader/UploaderStore';
import { IFile } from '~/types';
import { getURL } from '~/utils/dom';

import styles from './styles.module.scss';

export type OnSortEnd = (props: { oldIndex: number; newIndex: number }) => void;

interface SortableImageGridProps {
  onSortEnd: OnSortEnd;
  items: IFile[];
  locked: UploadStatus[];
  onDelete: (file_id: IFile['id']) => void;
  className?: string;
}

const SortableImageGrid: FC<SortableImageGridProps> = ({
  items,
  locked,
  onDelete,
  className,
  onSortEnd,
}) => {
  const [draggingItem, setDraggingItem] = useState<IFile | null>(null);

  const preventEvent = useCallback(event => event.preventDefault(), []);
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor)
  );

  const ids = useMemo(() => items.map(it => it.id ?? 0), [items]);
  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setDraggingItem(null);

      if (active.id === over?.id || !over?.id) {
        return;
      }

      const oldIndex = items.findIndex(it => it.id === active.id);
      const newIndex = items.findIndex(it => it.id === over.id);

      onSortEnd({ oldIndex, newIndex });
    },
    [items]
  );

  const onDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      if (!active.id) {
        return;
      }

      const activeItem = items.find(it => it.id === active.id);

      setDraggingItem(activeItem ?? null);
    },
    [items]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className={classNames(styles.grid, className)} onDropCapture={preventEvent}>
          {items
            .filter(file => file && file.id)
            .map((file, index) => (
              <SortableImageGridItem
                key={file.id}
                id={file.id!}
                className={file.id === draggingItem?.id ? styles.dragging : undefined}
              >
                <ImageUpload
                  id={file.id}
                  thumb={getURL(file, ImagePresets.cover)}
                  onDrop={onDelete}
                />
              </SortableImageGridItem>
            ))}

          {locked.map((item, index) => (
            <ImageUpload
              thumb={item.thumbnail}
              progress={item.progress}
              is_uploading
              key={item.id}
            />
          ))}

          <DragOverlay>
            {draggingItem ? (
              <div className={styles.overlay}>
                <ImageUpload thumb={getURL(draggingItem, ImagePresets.cover)} />
              </div>
            ) : null}
          </DragOverlay>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export { SortableImageGrid };
