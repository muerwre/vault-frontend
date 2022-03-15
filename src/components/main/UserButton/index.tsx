import React, { FC, useCallback } from 'react';

import { Group } from '~/components/containers/Group';
import { Icon } from '~/components/input/Icon';
import { ImagePresets } from '~/constants/urls';
import { IUser } from '~/types/auth';
import { getURL } from '~/utils/dom';

import styles from './styles.module.scss';

interface IProps {
  user: Partial<IUser>;
  onLogout: () => void;
  authOpenProfile: () => void;
}

const UserButton: FC<IProps> = ({ user: { username, photo }, authOpenProfile, onLogout }) => {
  const onProfileOpen = useCallback(() => {
    authOpenProfile();
  }, [authOpenProfile]);

  const onSettingsOpen = useCallback(() => {
    authOpenProfile();
  }, [authOpenProfile]);

  return (
    <div className={styles.wrap}>
      <Group horizontal className={styles.user_button}>
        <div className={styles.username}>{username}</div>

        <div
          className={styles.user_avatar}
          style={{ backgroundImage: `url('${getURL(photo, ImagePresets.avatar)}')` }}
        >
          {(!photo || !photo.id) && <Icon icon="profile" />}
        </div>
      </Group>

      <div className={styles.menu}>
        <div onClick={onProfileOpen}>Профиль</div>
        <div onClick={onSettingsOpen}>Настройки</div>
        <div onClick={onLogout}>Выдох</div>
      </div>
    </div>
  );
};

export { UserButton };
