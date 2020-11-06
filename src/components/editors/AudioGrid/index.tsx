import React, { FC, useCallback } from 'react';
import { SortEnd } from 'react-sortable-hoc';
import { IFile } from '~/redux/types';
import { IUploadStatus } from '~/redux/uploads/reducer';
import { moveArrItem } from '~/utils/fn';
import { SortableAudioGrid } from '~/components/editors/SortableAudioGrid';

import styles from './styles.module.scss';

interface IProps {
  files: IFile[];
  setFiles: (val: IFile[]) => void;
  locked: IUploadStatus[];
}

const AudioGrid: FC<IProps> = ({ files, setFiles, locked }) => {
  const onMove = useCallback(
    ({ oldIndex, newIndex }: SortEnd) => {
      setFiles(moveArrItem(oldIndex, newIndex, files.filter(file => !!file)) as IFile[]);
    },
    [setFiles, files]
  );

  const onDrop = useCallback(
    (remove_id: IFile['id']) => {
      setFiles(files.filter(file => file && file.id !== remove_id));
    },
    [setFiles, files]
  );

  const onTitleChange = useCallback(
    (changeId: IFile['id'], title: IFile['metadata']['title']) => {
      setFiles(
        files.map(file =>
          file && file.id === changeId ? { ...file, metadata: { ...file.metadata, title } } : file
        )
      );
    },
    [setFiles, files]
  );

  return (
    <SortableAudioGrid
      onDrop={onDrop}
      onTitleChange={onTitleChange}
      onSortEnd={onMove}
      axis="xy"
      items={files}
      locked={locked}
      pressDelay={window.innerWidth < 768 ? 200 : 0}
      helperClass={styles.helper}
    />
  );
};

export { AudioGrid };
