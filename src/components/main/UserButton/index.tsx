import React, { FC, useCallback } from 'react';

import { Group } from '~/components/containers/Group';
import { Icon } from '~/components/input/Icon';
import { MenuButton, MenuItemWithIcon } from '~/components/menu';
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

        <MenuButton
          position="bottom"
          translucent={false}
          icon={
            <div
              className={styles.user_avatar}
              style={{ backgroundImage: `url('${getURL(photo, ImagePresets.avatar)}')` }}
            >
              {(!photo || !photo.id) && <Icon icon="profile" />}
            </div>
          }
        >
          <MenuItemWithIcon onClick={onProfileOpen}>Профиль</MenuItemWithIcon>
          <MenuItemWithIcon onClick={onSettingsOpen}>Настройки</MenuItemWithIcon>
          <MenuItemWithIcon onClick={onLogout}>Выдох</MenuItemWithIcon>
        </MenuButton>
      </Group>
    </div>
  );
};

export { UserButton };
