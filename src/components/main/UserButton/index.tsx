import React, { FC, useCallback } from "react";
import { Group } from "~/components/containers/Group";
import styles from "./styles.module.scss";
import { getURL } from "~/utils/dom";
import { Icon } from "~/components/input/Icon";
import { IUser } from "~/redux/auth/types";
import { PRESETS } from "~/constants/urls";
import { authOpenProfile } from "~/redux/auth/actions";

interface IProps {
  user: Partial<IUser>;
  onLogout: () => void;
  authOpenProfile: typeof authOpenProfile;
}

const UserButton: FC<IProps> = ({ user: { username, photo }, authOpenProfile, onLogout }) => {
  const onProfileOpen = useCallback(() => {
    if (!username) return;
    authOpenProfile(username);
  }, [authOpenProfile, username]);

  const onSettingsOpen = useCallback(() => {
    if (!username) return;
    authOpenProfile(username);
  }, [authOpenProfile, username]);

  return (
    <div className={styles.wrap}>
      <Group horizontal className={styles.user_button}>
        <div className={styles.username}>{username}</div>

        <div
          className={styles.user_avatar}
          style={{ backgroundImage: `url('${getURL(photo, PRESETS.avatar)}')` }}
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
