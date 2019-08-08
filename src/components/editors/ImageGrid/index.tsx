import React, { FC, ReactChildren, useCallback, ChangeEventHandler, DragEventHandler } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import * as styles from './styles.scss';
import { ImageUpload } from '~/components/upload/ImageUpload';
import { IFile } from '~/redux/types';
import { IUploadStatus } from '~/redux/uploads/reducer';
import { ImageUploadButton } from '~/components/editors/ImageUploadButton';

interface IProps {
  items: IFile[];
  locked: IUploadStatus[];
  onFileMove: (o: number, n: number) => void;
  onUpload?: ChangeEventHandler<HTMLInputElement>;
  onDrop: DragEventHandler<HTMLFormElement>;
};

const SortableItem = SortableElement(({ children }) => <div className={styles.item}>{children}</div>);

const SortableList = SortableContainer(({ items, locked, onUpload, onDrop }: { items: IFile[]; locked: IUploadStatus[]; onUpload: ChangeEventHandler<HTMLInputElement>; onDrop: DragEventHandler<HTMLFormElement> }) => {
  return (
    <form className={styles.grid} onDrop={onDrop}>
      {
        items.map((file, index) => (
          <SortableItem key={file.id} index={index} collection={0}>
            <ImageUpload
              id={file.id}
              thumb={file.url}
            />
          </SortableItem>
        ))
      }
      {
        locked.map((item, index) => (
          <SortableItem key={item.temp_id} index={index} collection={1} disabled>
            <ImageUpload
              thumb={item.preview}
              progress={item.progress}
              is_uploading
            />
          </SortableItem>
        ))
      }
    </form>
  );
});

const ImageGrid: FC<IProps> = ({
  items,
  locked,
  onFileMove,
  onUpload,
  onDrop,
}) => {
  const onMove = useCallback(({ oldIndex, newIndex }) => onFileMove(oldIndex, newIndex), [onFileMove]);

  return (
    <SortableList onSortEnd={onMove} axis="xy" items={items} locked={locked} onUpload={onUpload} onDrop={onDrop} pressDelay={100} />
  )
}

export { ImageGrid };