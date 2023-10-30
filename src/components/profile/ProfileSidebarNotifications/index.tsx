import { useState, VFC } from 'react';

import { Group } from '~/components/containers/Group';
import { Button } from '~/components/input/Button';
import { HorizontalMenu } from '~/components/menu/HorizontalMenu';
import { useStackContext } from '~/components/sidebar/SidebarStack';
import { SidebarStackCard } from '~/components/sidebar/SidebarStackCard';
import { NotificationList } from '~/containers/notifications/NotificationList';
import { NotificationSettings } from '~/containers/notifications/NotificationSettings';
import { useNotificationSettings } from '~/hooks/notifications/useNotificationSettings';

import styles from './styles.module.scss';

interface ProfileSidebarNotificationsProps {}

enum Tabs {
  List,
  Settings,
}

const ProfileSidebarNotifications: VFC<
  ProfileSidebarNotificationsProps
> = () => {
  const { closeAllTabs } = useStackContext();
  const [tab, setTab] = useState(Tabs.List);
  const { loading } = useNotificationSettings();

  return (
    <SidebarStackCard width={400} onBackPress={closeAllTabs}>
      <div className={styles.grid}>
        <Group className={styles.head} horizontal>
          <HorizontalMenu className={styles.tabs}>
            <HorizontalMenu.Item
              active={tab === Tabs.List}
              isLoading={loading}
              onClick={() => setTab(Tabs.List)}
              stretchy
            >
              Уведомления
            </HorizontalMenu.Item>

            <HorizontalMenu.Item
              active={tab === Tabs.Settings}
              isLoading={loading}
              onClick={() => setTab(Tabs.Settings)}
              stretchy
            >
              Настройки
            </HorizontalMenu.Item>
          </HorizontalMenu>

          <Button iconLeft="right" color="link" onClick={closeAllTabs} />
        </Group>

        <div className={styles.list}>
          {tab === Tabs.List ? <NotificationList /> : <NotificationSettings />}
        </div>
      </div>
    </SidebarStackCard>
  );
};

export { ProfileSidebarNotifications };
