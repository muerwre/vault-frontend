import {
  ChangeEvent,
  FC,
  MouseEvent,
  RefObject,
  useCallback,
  useState,
} from 'react';

import classNames from 'classnames';

import { Icon } from '~/components/common/Icon';
import { LoaderCircle } from '~/components/common/LoaderCircle';

import styles from './styles.module.scss';

interface Props {
  /** Shows the delete button when there is something to delete. */
  hasPhoto: boolean;
  onUpload: (file: File) => Promise<unknown>;
  onDelete: () => Promise<unknown> | void;
  uploadTitle?: string;
  deleteTitle?: string;
  className?: string;
  /** Lets the parent open the file picker, e.g. when the photo is clicked. */
  inputRef?: RefObject<HTMLInputElement>;
}

// The parent may open the picker on click; clicks on the pill's own buttons
// must not reach it, or deleting would open the picker too.
const stopPropagation = (event: MouseEvent) => event.stopPropagation();

/**
 * A dark pill of upload and delete buttons laid over a photo. Shows a loader
 * while either action runs. Positioning is up to the parent, via className.
 */
const PhotoUploadPill: FC<Props> = ({
  hasPhoto,
  onUpload,
  onDelete,
  uploadTitle = 'Загрузить фото',
  deleteTitle = 'Удалить фото',
  className,
  inputRef,
}) => {
  const [isBusy, setIsBusy] = useState(false);

  const run = useCallback(async (action: () => Promise<unknown> | void) => {
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
    <div
      className={classNames(styles.pill, className)}
      onClick={stopPropagation}
    >
      {isBusy ? (
        <div className={styles.loader}>
          <LoaderCircle size={20} />
        </div>
      ) : (
        <>
          {hasPhoto && (
            <button
              type="button"
              className={styles.action}
              onClick={onDeleteClick}
              title={deleteTitle}
            >
              <Icon icon="close" size={20} />
            </button>
          )}

          <label className={styles.action} title={uploadTitle}>
            <Icon icon="photo_add" size={20} />
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className={styles.input}
              onChange={onInputChange}
            />
          </label>
        </>
      )}
    </div>
  );
};

export { PhotoUploadPill };
