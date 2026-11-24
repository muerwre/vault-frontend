import { FC, useCallback, useRef } from 'react';

import { PhotoUploadPill } from '~/components/upload/PhotoUploadPill';
import { imagePresets } from '~/constants/urls';
import { usePatchUser } from '~/hooks/auth/usePatchUser';
import { useUser } from '~/hooks/auth/useUser';
import { getURL } from '~/utils/dom';

import styles from './styles.module.scss';

/**
 * The user's cover, as the node editor's background: a preview of it that
 * picks a new one on click. It shows behind the profile and settings pages.
 */
const ProfileCoverEditor: FC = () => {
  const { user } = useUser();
  const { updateCover, deleteCover } = usePatchUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const background = user.cover
    ? `url("${getURL(user.cover, imagePresets['1600'])}")`
    : undefined;

  return (
    <div
      className={styles.wrap}
      style={{ backgroundImage: background }}
      onClick={openPicker}
    >
      {!user.cover && <span className={styles.label}>Фон профиля</span>}

      <PhotoUploadPill
        hasPhoto={!!user.cover}
        onUpload={updateCover}
        onDelete={deleteCover}
        uploadTitle="Загрузить фон"
        deleteTitle="Убрать фон"
        className={styles.pill}
        inputRef={inputRef}
      />
    </div>
  );
};

export { ProfileCoverEditor };
