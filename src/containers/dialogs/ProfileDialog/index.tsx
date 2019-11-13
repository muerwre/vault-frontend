import React, { FC, useState, useCallback } from 'react';
import { BetterScrollDialog } from '../BetterScrollDialog';
import { ProfileInfo } from '~/containers/profile/ProfileInfo';
import { IDialogProps } from '~/redux/types';
import { connect } from 'react-redux';
import { selectAuthProfile } from '~/redux/auth/selectors';
import { ProfileMessages } from '~/containers/profile/ProfileMessages';
import { ProfileDescription } from '~/components/profile/ProfileDescription';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { IAuthState } from '~/redux/auth/types';

const TAB_CONTENT = {
  profile: <ProfileDescription />,
  messages: <ProfileMessages />,
};
const mapStateToProps = selectAuthProfile;
const mapDispatchToProps = {
  authSetProfile: AUTH_ACTIONS.authSetProfile,
};

type IProps = IDialogProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const ProfileDialogUnconnected: FC<IProps> = ({
  onRequestClose,
  authSetProfile,
  is_loading,
  user,
  tab,
}) => {
  const setTab = useCallback((val: IAuthState['profile']['tab']) => authSetProfile({ tab: val }), [
    authSetProfile,
  ]);

  return (
    <BetterScrollDialog
      header={<ProfileInfo is_loading={is_loading} user={user} tab={tab} setTab={setTab} />}
      onClose={onRequestClose}
    >
      {TAB_CONTENT[tab] || null}
    </BetterScrollDialog>
  );
};

const ProfileDialog = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileDialogUnconnected);

export { ProfileDialog };
