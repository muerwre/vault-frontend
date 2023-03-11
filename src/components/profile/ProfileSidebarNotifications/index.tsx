import { VFC } from 'react';

import { useStackContext } from '~/components/sidebar/SidebarStack';
import { SidebarStackCard } from '~/components/sidebar/SidebarStackCard';

import { NotificationList } from '../../../containers/notifications/NotificationList/index';

interface ProfileSidebarNotificationsProps {}

const ProfileSidebarNotifications: VFC<
  ProfileSidebarNotificationsProps
> = () => {
  const { closeAllTabs } = useStackContext();

  return (
    <SidebarStackCard
      width={400}
      headerFeature="back"
      title="Уведомления"
      onBackPress={closeAllTabs}
    >
      <NotificationList />
    </SidebarStackCard>
  );
};

export { ProfileSidebarNotifications };
