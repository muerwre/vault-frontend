import React, { FC, useState } from 'react';
import { BetterScrollDialog } from '../BetterScrollDialog';
import { ProfileInfo } from '~/containers/profile/ProfileInfo';
import { IDialogProps } from '~/redux/types';
import { connect } from 'react-redux';
import { selectAuthProfile } from '~/redux/auth/selectors';
import { ProfileMessages } from '~/containers/profile/ProfileMessages';

const TAB_CONTENT = {
  profile: <div>PROFILE</div>,
  messages: <ProfileMessages />,
};
const mapStateToProps = selectAuthProfile;
const mapDispatchToProps = {};

type IProps = IDialogProps & ReturnType<typeof mapStateToProps> & {};

const ProfileDialogUnconnected: FC<IProps> = ({ onRequestClose, is_loading, user }) => {
  const [tab, setTab] = useState('messages');

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
