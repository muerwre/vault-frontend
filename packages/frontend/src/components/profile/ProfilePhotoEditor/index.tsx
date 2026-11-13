import { FC, useCallback, useRef } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { PhotoUploadPill } from '~/components/upload/PhotoUploadPill';
import { imagePresets } from '~/constants/urls';
import { IFile } from '~/types';

import styles from './styles.module.scss';

interface Props {
  photo?: IFile;
  size?: number;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
}

/**
 * The user's own photo, large, with upload and delete controls under it.
 * Clicking the photo itself opens the file picker too.
 */
const ProfilePhotoEditor: FC<Props> = ({
  photo,
  size = 160,
  onUpload,
  onDelete,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const openPicker = useCallback(() => inputRef.current?.click(), []);

  return (
    <div className={styles.wrap} style={{ width: size }} onClick={openPicker}>
      <Avatar
        url={photo?.url}
        size={size}
        preset={imagePresets[300]}
        className={styles.avatar}
      />

      <PhotoUploadPill
        hasPhoto={!!photo}
        onUpload={onUpload}
        onDelete={onDelete}
        className={styles.pill}
        inputRef={inputRef}
      />
    </div>
  );
};

export { ProfilePhotoEditor };
