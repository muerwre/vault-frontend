import React, { FC, useState, useCallback } from 'react';
import { BetterScrollDialog } from '../BetterScrollDialog';
import { ProfileInfo } from '~/containers/profile/ProfileInfo';
import { IDialogProps } from '~/redux/types';
import { connect } from 'react-redux';
import { selectAuthProfile, selectAuthUser } from '~/redux/auth/selectors';
import { ProfileMessages } from '~/containers/profile/ProfileMessages';
import { ProfileDescription } from '~/components/profile/ProfileDescription';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { IAuthState } from '~/redux/auth/types';
import pick from 'ramda/es/pick';
import { CoverBackdrop } from '~/components/containers/CoverBackdrop';

const TAB_CONTENT = {
  profile: <ProfileDescription />,
  messages: <ProfileMessages />,
};

const mapStateToProps = state => ({
  profile: selectAuthProfile(state),
  user: pick(['id'], selectAuthUser(state)),
});

const mapDispatchToProps = {
  authSetProfile: AUTH_ACTIONS.authSetProfile,
};

type IProps = IDialogProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

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
        />
      }
      backdrop={<CoverBackdrop cover={user && user.cover} />}
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
