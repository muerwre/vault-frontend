import { ChangeEvent, FC, useCallback } from 'react';

import classNames from 'classnames';

import { Avatar } from '~/components/common/Avatar';
import { Button } from '~/components/input/Button';
import { IFile } from '~/types';

import styles from './styles.module.scss';

export interface ProfileAvatarProps {
  size?: number;
  canEdit: boolean;
  photo?: IFile;
  onChangePhoto?: (file: File) => void;
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

      onChangePhoto?.(event.target.files[0]);
    },
    [onChangePhoto],
  );

  return (
    <Avatar
      url={photo?.url}
      size={size}
      className={classNames(styles.avatar, { [styles.editable]: canEdit })}
    >
      {canEdit && <input type="file" onInput={onInputChange} />}
      {canEdit && (
        <Button
          type="button"
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
