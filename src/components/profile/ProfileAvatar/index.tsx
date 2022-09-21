import React, { ChangeEvent, FC, useCallback } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { Button } from '~/components/input/Button';
import { ImagePresets } from '~/constants/urls';
import { IFile } from '~/types';
import { getURL } from '~/utils/dom';

import styles from './styles.module.scss';

export interface ProfileAvatarProps {
  size?: number;
  canEdit: boolean;
  photo?: IFile;
  onChangePhoto: (file: File) => void;
}

const ProfileAvatar: FC<ProfileAvatarProps> = ({
  photo,
  onChangePhoto,
  canEdit,
  size,
}) => {
  const onInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files?.length) {
        return;
      }

      onChangePhoto(event.target.files[0]);
    },
    [onChangePhoto],
  );

  const backgroundImage = photo
    ? `url("${getURL(photo, ImagePresets.avatar)}")`
    : undefined;

  return (
    <Avatar url={backgroundImage} size={size} className={styles.avatar}>
      {canEdit && <input type="file" onInput={onInputChange} />}
      {canEdit && (
        <Button
          color="info"
          iconLeft="photo_add"
          round
          iconOnly
          className={styles.button}
        />
      )}
    </Avatar>
  );
};

export { ProfileAvatar };
