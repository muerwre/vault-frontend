import React, { FC } from 'react';
import { BetterScrollDialog } from '../../../components/dialogs/BetterScrollDialog';
import { ProfileInfo } from '~/containers/profile/ProfileInfo';
import { CoverBackdrop } from '~/components/containers/CoverBackdrop';
import { Tabs } from '~/components/dialogs/Tabs';
import { ProfileDescription } from '~/components/profile/ProfileDescription';
import { ProfileMessages } from '~/containers/profile/ProfileMessages';
import { ProfileSettings } from '~/components/profile/ProfileSettings';
import { ProfileAccounts } from '~/containers/profile/ProfileAccounts';
import { DialogComponentProps } from '~/types/modal';
import { useUser } from '~/hooks/auth/useUser';
import { useGetProfile } from '~/hooks/profile/useGetProfile';
import { ProfileProvider } from '~/utils/providers/ProfileProvider';

export interface ProfileDialogProps extends DialogComponentProps {
  username: string;
}

const ProfileDialog: FC<ProfileDialogProps> = ({ username, onRequestClose }) => {
  const { isLoading, profile } = useGetProfile(username);
  const {
    user: { id },
  } = useUser();

  return (
    <ProfileProvider username={username}>
      <Tabs>
        <BetterScrollDialog
          header={<ProfileInfo isOwn={profile.id === id} isLoading={isLoading} />}
          backdrop={<CoverBackdrop cover={profile.cover} />}
          onClose={onRequestClose}
        >
          <Tabs.Content>
            <ProfileDescription />
            <ProfileMessages />
            <ProfileSettings />
            <ProfileAccounts />
          </Tabs.Content>
        </BetterScrollDialog>
      </Tabs>
    </ProfileProvider>
  );
};

export { ProfileDialog };
