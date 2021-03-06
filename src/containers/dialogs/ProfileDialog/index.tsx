import React, { FC, useCallback } from 'react';
import { BetterScrollDialog } from '../BetterScrollDialog';
import { ProfileInfo } from '~/containers/profile/ProfileInfo';
import { IDialogProps } from '~/redux/types';
import { connect } from 'react-redux';
import { selectAuthProfile, selectAuthUser } from '~/redux/auth/selectors';
import { ProfileMessages } from '~/containers/profile/ProfileMessages';
import { ProfileDescription } from '~/components/profile/ProfileDescription';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { IAuthState } from '~/redux/auth/types';
import { pick } from 'ramda';
import { CoverBackdrop } from '~/components/containers/CoverBackdrop';
import { ProfileSettings } from '~/components/profile/ProfileSettings';
import { ProfileAccounts } from '~/components/profile/ProfileAccounts';
import { MessageForm } from '~/components/profile/MessageForm';

const TAB_CONTENT = {
  profile: <ProfileDescription />,
  messages: <ProfileMessages />,
  settings: <ProfileSettings />,
  accounts: <ProfileAccounts />,
};

const mapStateToProps = state => ({
  profile: selectAuthProfile(state),
  user: pick(['id'], selectAuthUser(state)),
});

const mapDispatchToProps = {
  authSetProfile: AUTH_ACTIONS.authSetProfile,
};

type IProps = IDialogProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const PROFILE_HEADERS = {
  // messages: <MessageForm />,
};

const PROFILE_FOOTERS = {
  messages: <MessageForm />,
};

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
      {TAB_CONTENT[tab] || null}
    </BetterScrollDialog>
  );
};

const ProfileDialog = connect(mapStateToProps, mapDispatchToProps)(ProfileDialogUnconnected);

export { ProfileDialog };
