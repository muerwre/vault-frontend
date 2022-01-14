import React, { VFC } from 'react';
import { SidebarWrapper } from '~/containers/sidebars/SidebarWrapper';
import { DialogComponentProps } from '~/types/modal';
import { ProfileSidebarMenu } from '~/containers/profile/ProfileSidebarMenu';
import { SidebarStack } from '~/components/sidebar/SidebarStack';
import { ProfileSidebarSettings } from '~/components/profile/ProfileSidebarSettings';

interface ProfileSidebarProps extends DialogComponentProps {}

const ProfileSidebar: VFC<ProfileSidebarProps> = ({ onRequestClose }) => {
  return (
    <SidebarWrapper onClose={onRequestClose}>
      <SidebarStack>
        <ProfileSidebarMenu onClose={onRequestClose} />
        <ProfileSidebarSettings />
      </SidebarStack>
    </SidebarWrapper>
  );
};

export { ProfileSidebar };
