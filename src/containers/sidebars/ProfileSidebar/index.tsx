import React, { VFC } from 'react';
import { SidebarWrapper } from '~/containers/sidebars/SidebarWrapper';
import { DialogComponentProps } from '~/types/modal';
import { ProfileSidebarMenu } from '~/containers/profile/ProfileSidebarMenu';
import { SidebarStack } from '~/components/sidebar/SidebarStack';
import { ProfileSidebarSettings } from '~/components/profile/ProfileSidebarSettings';
import { SidebarStackCard } from '~/components/sidebar/SidebarStackCard';

interface ProfileSidebarProps extends DialogComponentProps {}

const ProfileSidebar: VFC<ProfileSidebarProps> = ({ onRequestClose }) => {
  return (
    <SidebarWrapper onClose={onRequestClose}>
      <SidebarStack>
        <SidebarStackCard headerFeature="close" title="Профиль">
          <ProfileSidebarMenu onClose={onRequestClose} />
        </SidebarStackCard>

        <SidebarStackCard width={600} headerFeature="back" title="Настройки">
          <ProfileSidebarSettings />
        </SidebarStackCard>
      </SidebarStack>
    </SidebarWrapper>
  );
};

export { ProfileSidebar };
