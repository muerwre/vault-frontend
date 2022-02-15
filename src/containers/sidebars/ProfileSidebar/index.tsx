import React, { VFC } from 'react';

import { Tabs } from '~/components/dialogs/Tabs';
import { ProfileSidebarSettings } from '~/components/profile/ProfileSidebarSettings';
import { SidebarStack } from '~/components/sidebar/SidebarStack';
import { SidebarStackCard } from '~/components/sidebar/SidebarStackCard';
import { ProfileSidebarMenu } from '~/containers/profile/ProfileSidebarMenu';
import { SidebarWrapper } from '~/containers/sidebars/SidebarWrapper';
import { DialogComponentProps } from '~/types/modal';

interface ProfileSidebarProps extends DialogComponentProps {}

const ProfileSidebar: VFC<ProfileSidebarProps> = ({ onRequestClose }) => {
  return (
    <SidebarWrapper onClose={onRequestClose}>
      <SidebarStack>
        <SidebarStackCard headerFeature="close" title="Профиль" onBackPress={onRequestClose}>
          <ProfileSidebarMenu onClose={onRequestClose} />
        </SidebarStackCard>

        <SidebarStack.Cards>
          <ProfileSidebarSettings />
        </SidebarStack.Cards>
      </SidebarStack>
    </SidebarWrapper>
  );
};

export { ProfileSidebar };
