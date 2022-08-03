import React, { useCallback, VFC } from "react";

import classNames from "classnames";

import { Filler } from "~/components/containers/Filler";
import { Group } from "~/components/containers/Group";
import { Button } from "~/components/input/Button";
import { Icon } from "~/components/input/Icon";
import { MenuButton, MenuItemWithIcon } from "~/components/menu";
import { VerticalMenu } from "~/components/menu/VerticalMenu";
import { useStackContext } from "~/components/sidebar/SidebarStack";
import { ProfileSidebarHead } from "~/containers/profile/ProfileSidebarHead";
import { ProfileStats } from "~/containers/profile/ProfileStats";
import { useAuth } from "~/hooks/auth/useAuth";
import markdown from "~/styles/common/markdown.module.scss";

import { ProfileSidebarLogoutButton } from "../ProfileSidebarLogoutButton";

import styles from "./styles.module.scss";

interface ProfileSidebarMenuProps {
  onClose: () => void;
}

const ProfileSidebarMenu: VFC<ProfileSidebarMenuProps> = ({ onClose }) => {
  const { logout } = useAuth();
  const { setActiveTab } = useStackContext();

  const onLogout = useCallback(() => {
    logout();
    onClose();
  }, [onClose]);

  return (
    <div className={styles.wrap}>
      <div>
        <ProfileSidebarHead />
      </div>

      <Filler className={classNames(markdown.wrapper, styles.text)}>
        <Group>
          <VerticalMenu className={styles.menu}>
            <VerticalMenu.Item onClick={() => setActiveTab(0)}>
              Настройки
            </VerticalMenu.Item>

            <VerticalMenu.Item onClick={() => setActiveTab(1)}>
              Заметки
            </VerticalMenu.Item>
          </VerticalMenu>

          <div className={styles.stats}>
            <ProfileStats />
          </div>
        </Group>
      </Filler>

      <Group className={styles.buttons} horizontal>
        <Filler />
        <ProfileSidebarLogoutButton onLogout={onLogout} />
      </Group>
    </div>
  );
};

export { ProfileSidebarMenu };
