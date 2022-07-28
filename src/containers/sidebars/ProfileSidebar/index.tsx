import { VFC } from 'react';

import { ProfileSidebarNotes } from '~/components/profile/ProfileSidebarNotes';
import { ProfileSidebarSettings } from '~/components/profile/ProfileSidebarSettings';
import { SidebarStack } from '~/components/sidebar/SidebarStack';
import { SidebarStackCard } from '~/components/sidebar/SidebarStackCard';
import { ProfileSidebarMenu } from '~/containers/profile/ProfileSidebarMenu';
import { SidebarWrapper } from '~/containers/sidebars/SidebarWrapper';
import { DialogComponentProps } from '~/types/modal';

interface ProfileSidebarProps extends DialogComponentProps {
  page: string;
}

const ProfileSidebar: VFC<ProfileSidebarProps> = ({ onRequestClose }) => {
  return (
    <SidebarWrapper onClose={onRequestClose}>
      <SidebarStack>
        <SidebarStackCard headerFeature="close" title="Профиль" onBackPress={onRequestClose}>
          <ProfileSidebarMenu onClose={onRequestClose} />
        </SidebarStackCard>

        <SidebarStack.Cards>
          <ProfileSidebarSettings />
          <ProfileSidebarNotes />
        </SidebarStack.Cards>
      </SidebarStack>
    </SidebarWrapper>
  );
};

export { ProfileSidebar };
