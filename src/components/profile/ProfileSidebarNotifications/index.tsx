import { VFC } from 'react';

import { Padder } from '~/components/containers/Padder';
import { useStackContext } from '~/components/sidebar/SidebarStack';
import { SidebarStackCard } from '~/components/sidebar/SidebarStackCard';
import { NotificationSettings } from '~/containers/notifications/NotificationSettings';

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
      <NotificationSettings />
    </SidebarStackCard>
  );
};

export { ProfileSidebarNotifications };
