import { FC, useState } from 'react';

import { LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react';

import { MenuButton } from '~/components/menu/MenuButton';
import { MenuItemWithIcon } from '~/components/menu/MenuItemWithIcon';
import { URLS } from '~/constants/urls';
import { useAuth } from '~/hooks/auth/useAuth';
import { useNavigation } from '~/hooks/navigation/useNavigation';
import { useNotifications } from '~/utils/providers/NotificationProvider';

import { UserButtonFace } from './components/UserButton';

interface UserButtonWithNotificationsProps {}

/** The signed-in user in the header, with a menu: profile, settings, log out. */
const UserButtonWithNotifications: FC<
  UserButtonWithNotificationsProps
> = () => {
  const { user, logout } = useAuth();
  const { push } = useNavigation();
  const { hasNew, indicatorEnabled } = useNotifications();
  // the menu's arrow points at the avatar, not the middle of name and avatar
  const [avatar, setAvatar] = useState<HTMLDivElement | null>(null);

  return (
    <MenuButton
      position="bottom-end"
      fixed
      portal
      anchor={avatar}
      icon={
        <UserButtonFace
          avatarRef={setAvatar}
          hasUpdates={hasNew && indicatorEnabled}
          username={user.username}
          photo={user.photo}
        />
      }
    >
      <MenuItemWithIcon
        icon={<UserIcon size={20} />}
        onClick={() => push(URLS.PROFILE_PAGE(user.username))}
      >
        Профиль
      </MenuItemWithIcon>

      <MenuItemWithIcon
        icon={<SettingsIcon size={20} />}
        onClick={() => push(URLS.SETTINGS.BASE)}
      >
        Настройки
      </MenuItemWithIcon>

      <MenuItemWithIcon icon={<LogOutIcon size={20} />} onClick={logout}>
        Выйти
      </MenuItemWithIcon>
    </MenuButton>
  );
};

export { UserButtonWithNotifications };
