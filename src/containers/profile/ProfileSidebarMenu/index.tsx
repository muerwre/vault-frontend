import { useCallback, VFC } from 'react';

import classNames from 'classnames';

import { Filler } from '~/components/common/Filler';
import { Group } from '~/components/common/Group';
import { Zone } from '~/components/common/Zone';
import { VerticalMenu } from '~/components/menu/VerticalMenu';
import { useStackContext } from '~/components/sidebar/SidebarStack';
import { ProfileSidebarHead } from '~/containers/profile/ProfileSidebarHead';
import { ProfileStats } from '~/containers/profile/ProfileStats';
import { ThemeSwitcher } from '~/containers/settings/ThemeSwitcher';
import { useAuth } from '~/hooks/auth/useAuth';
import markdown from '~/styles/common/markdown.module.scss';
import { useNotifications } from '~/utils/providers/NotificationProvider';

import { ProfileSidebarLogoutButton } from '../ProfileSidebarLogoutButton';
import { ProfileToggles } from '../ProfileToggles';

import styles from './styles.module.scss';

interface ProfileSidebarMenuProps {
  onClose: () => void;
}

const ProfileSidebarMenu: VFC<ProfileSidebarMenuProps> = ({ onClose }) => {
  const { logout } = useAuth();
  const { setActiveTab } = useStackContext();
  const { hasNew } = useNotifications();

  const onLogout = useCallback(() => {
    logout();
    onClose();
  }, [logout, onClose]);

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

            <VerticalMenu.Item
              onClick={() => setActiveTab(1)}
              hasUpdates={hasNew}
            >
              Уведомления
            </VerticalMenu.Item>

            <VerticalMenu.Item onClick={() => setActiveTab(2)}>
              Заметки
            </VerticalMenu.Item>
          </VerticalMenu>

          <Group className={styles.toggles}>
            <Zone>
              <ProfileToggles />
            </Zone>

            <Zone>
              <ThemeSwitcher />
            </Zone>
          </Group>

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
