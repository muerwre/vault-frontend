import React, { FC, useCallback } from 'react';

import { SortEnd } from 'react-sortable-hoc';

import { OnSortEnd, SortableImageGrid } from '~/components/editors/SortableImageGrid';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { UploadStatus } from '~/store/uploader/UploaderStore';
import { IFile } from '~/types';
import { moveArrItem } from '~/utils/fn';

import styles from './styles.module.scss';

interface IProps {
  files: IFile[];
  setFiles: (val: IFile[]) => void;
  locked: UploadStatus[];
}

const ImageGrid: FC<IProps> = ({ files, setFiles, locked }) => {
  const { innerWidth } = useWindowSize();

  const onMove = useCallback<OnSortEnd>(
    ({ oldIndex, newIndex }) => {
      setFiles(
        moveArrItem(
          oldIndex,
          newIndex,
          files.filter(file => !!file)
        ) as IFile[]
      );
    },
    [setFiles, files]
  );

  const onDrop = useCallback(
    (remove_id: IFile['id']) => {
      setFiles(files.filter(file => file && file.id !== remove_id));
    },
    [setFiles, files]
  );

  return <SortableImageGrid onDelete={onDrop} onSortEnd={onMove} items={files} locked={locked} />;
};

export { ImageGrid };
