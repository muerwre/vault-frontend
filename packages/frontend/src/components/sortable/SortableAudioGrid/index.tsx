import { FC, ReactNode, useMemo } from 'react';

import classNames from 'classnames';

import { AudioPlayer } from '~/components/common/AudioPlayer';
import { AudioUpload } from '~/components/upload/AudioUpload';
import { UploadStatus } from '~/store/uploader/UploaderStore';
import { IFile } from '~/types';

import { SortableList } from '../SortableList';

import styles from './styles.module.scss';

type OnSortEnd = (newValue: IFile[]) => void;

interface SortableAudioGridProps {
  onSortEnd: OnSortEnd;
  items: IFile[];
  locked: UploadStatus[];
  className?: string;
  trailing?: ReactNode;
  onDelete: (file_id: IFile['id']) => void;
  onTitleChange: (file_id: IFile['id'], title: string) => void;
  /**
   * Songs joined into one list, ridged around and between like a post's
   * player. `trailing` then goes under the list rather than in it.
   */
  outlined?: boolean;
}
const renderItem = ({
  item,
  key,
  onDelete,
  onTitleChange,
}: {
  item: IFile;
  key?: string | number;
  onDelete?: (id: IFile['id']) => void;
  onTitleChange?: (file_id: IFile['id'], title: string) => void;
}) => (
  <AudioPlayer
    file={item}
    onDelete={onDelete}
    isEditing
    onTitleChange={onTitleChange}
    key={key}
  />
);

const renderLocked = ({ locked }: { locked: UploadStatus }) => (
  <AudioUpload
    id={locked.id}
    uploading
    title={locked.name}
    progress={locked.progress}
    key={locked.id}
  />
);

const SortableAudioGrid: FC<SortableAudioGridProps> = ({
  items,
  locked,
  onDelete,
  className,
  onSortEnd,
  trailing,
  onTitleChange,
  outlined,
}) => {
  const renderItemProps = useMemo(
    () => ({ onDelete, onTitleChange }),
    [onDelete, onTitleChange],
  );
  const renderLockedProps = useMemo(() => ({}), []);

  const list = (
    <SortableList
      items={items}
      locked={locked}
      getID={(it) => it.id}
      getLockedID={(it) => it.id}
      renderItem={renderItem}
      renderItemProps={renderItemProps}
      renderLocked={renderLocked}
      renderLockedProps={renderLockedProps}
      onSortEnd={onSortEnd}
      className={classNames(className, { [styles.outlined]: outlined })}
      trailing={outlined ? undefined : trailing}
    />
  );

  if (!outlined || !trailing) {
    return list;
  }

  return (
    <div className={styles.wrap}>
      {list}
      {trailing}
    </div>
  );
};

export { SortableAudioGrid };
