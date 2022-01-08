import React, { FC, useCallback } from 'react';
import { BetterScrollDialog } from '../BetterScrollDialog';
import { ProfileInfo } from '~/containers/profile/ProfileInfo';
import { connect } from 'react-redux';
import { selectAuthProfile, selectAuthUser } from '~/redux/auth/selectors';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { IAuthState } from '~/redux/auth/types';
import { pick } from 'ramda';
import { CoverBackdrop } from '~/components/containers/CoverBackdrop';
import { Tabs } from '~/components/dialogs/Tabs';
import { ProfileDescription } from '~/components/profile/ProfileDescription';
import { ProfileMessages } from '~/containers/profile/ProfileMessages';
import { ProfileSettings } from '~/components/profile/ProfileSettings';
import { ProfileAccounts } from '~/components/profile/ProfileAccounts';
import { IDialogProps } from '~/types/modal';

const mapStateToProps = state => ({
  profile: selectAuthProfile(state),
  user: pick(['id'], selectAuthUser(state)),
});

const mapDispatchToProps = {
  authSetProfile: AUTH_ACTIONS.authSetProfile,
};

type IProps = IDialogProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const PROFILE_HEADERS = {};

const PROFILE_FOOTERS = {};

const ProfileDialogUnconnected: FC<IProps> = ({
  onRequestClose,
  authSetProfile,

  profile: { is_loading, user, tab },
  user: { id },
}) => {
  const setTab = useCallback((val: IAuthState['profile']['tab']) => authSetProfile({ tab: val }), [
    authSetProfile,
  ]);

  return (
    <Tabs>
      <BetterScrollDialog
        header={
          <ProfileInfo
            is_own={user && user.id === id}
            is_loading={is_loading}
            user={user}
            tab={tab}
            setTab={setTab}
            content={PROFILE_HEADERS[tab]}
          />
        }
        footer={PROFILE_FOOTERS[tab]}
        backdrop={<CoverBackdrop cover={user && user.cover} />}
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
  );
};

const ProfileDialog = connect(mapStateToProps, mapDispatchToProps)(ProfileDialogUnconnected);

export { ProfileDialog };
