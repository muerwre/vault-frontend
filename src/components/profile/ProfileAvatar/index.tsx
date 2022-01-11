import React, { ChangeEvent, FC, useCallback } from 'react';
import styles from './styles.module.scss';
import { getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import { Icon } from '~/components/input/Icon';
import { IFile } from '~/types';
import { Button } from '~/components/input/Button';

export interface ProfileAvatarProps {
  canEdit: boolean;
  photo?: IFile;
  onChangePhoto: (file: File) => void;
}

const ProfileAvatar: FC<ProfileAvatarProps> = ({ photo, onChangePhoto, canEdit }) => {
  const onInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files?.length) {
        return;
      }

      onChangePhoto(event.target.files[0]);
    },
    [onChangePhoto]
  );

  const backgroundImage = photo ? `url("${getURL(photo, PRESETS.avatar)}")` : undefined;

  return (
    <div
      className={styles.avatar}
      style={{
        backgroundImage,
      }}
    >
      {canEdit && <input type="file" onInput={onInputChange} />}
      {canEdit && <Button iconLeft="photo_add" round iconOnly className={styles.can_edit} />}
    </div>
  );
};

export { ProfileAvatar };
