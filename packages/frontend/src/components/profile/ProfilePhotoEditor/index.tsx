import { ChangeEvent, FC, useCallback, useState } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { Icon } from '~/components/common/Icon';
import { LoaderCircle } from '~/components/common/LoaderCircle';
import { imagePresets } from '~/constants/urls';
import { IFile } from '~/types';

import styles from './styles.module.scss';

interface Props {
  photo?: IFile;
  size?: number;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
}

/** The user's own photo, large, with upload and delete controls under it. */
const ProfilePhotoEditor: FC<Props> = ({
  photo,
  size = 160,
  onUpload,
  onDelete,
}) => {
  const [isBusy, setIsBusy] = useState(false);

  const run = useCallback(async (action: () => Promise<void>) => {
    setIsBusy(true);

    try {
      await action();
    } finally {
      setIsBusy(false);
    }
  }, []);

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      // Cleared so picking the same file again still fires a change.
      event.target.value = '';

      if (file) {
        run(() => onUpload(file));
      }
    },
    [onUpload, run],
  );

  const onDeleteClick = useCallback(() => run(onDelete), [onDelete, run]);

  return (
    <div className={styles.wrap} style={{ width: size }}>
      <Avatar
        url={photo?.url}
        size={size}
        preset={imagePresets[300]}
        className={styles.avatar}
      />

      <div className={styles.pill}>
        {isBusy ? (
          <div className={styles.loader}>
            <LoaderCircle size={20} />
          </div>
        ) : (
          <>
            {!!photo && (
              <button
                type="button"
                className={styles.action}
                onClick={onDeleteClick}
                title="Удалить фото"
              >
                <Icon icon="close" size={20} />
              </button>
            )}

            <label className={styles.action} title="Загрузить фото">
              <Icon icon="photo_add" size={20} />
              <input
                type="file"
                accept="image/*"
                className={styles.input}
                onChange={onInputChange}
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
};

export { ProfilePhotoEditor };
