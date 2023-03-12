import { FC, useCallback } from 'react';

import { UserButton } from '~/components/main/UserButton';
import { SidebarName } from '~/constants/sidebar';
import { useAuth } from '~/hooks/auth/useAuth';
import { useNotifications } from '~/utils/providers/NotificationProvider';
import { useSidebar } from '~/utils/providers/SidebarProvider';

interface UserButtonWithNotificationsProps {}

const UserButtonWithNotifications: FC<
  UserButtonWithNotificationsProps
> = () => {
  const { user } = useAuth();
  const { open } = useSidebar();
  const { hasNew, indicatorEnabled } = useNotifications();

  const openProfileSidebar = useCallback(() => {
    open(SidebarName.Settings, {});
  }, [open]);

  return (
    <UserButton
      hasUpdates={hasNew && indicatorEnabled}
      username={user.username}
      photo={user.photo}
      onClick={openProfileSidebar}
    />
  );
};

export { UserButtonWithNotifications };
