import React, { FC } from 'react';
import { BetterScrollDialog } from '../BetterScrollDialog';
import styles from './styles.scss';
import { ProfileInfo } from '~/containers/profile/ProfileInfo';
import { IDialogProps } from '~/redux/types';
import { connect } from 'react-redux';
import { selectAuthProfile } from '~/redux/auth/selectors';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { CommentForm } from '~/components/node/CommentForm';
import { ProfileMessages } from '~/containers/profile/ProfileMessages';

const mapStateToProps = selectAuthProfile;
const mapDispatchToProps = {};

type IProps = IDialogProps & ReturnType<typeof mapStateToProps> & {};

const ProfileDialogUnconnected: FC<IProps> = ({ onRequestClose, is_loading, user }) => (
  <BetterScrollDialog
    header={<ProfileInfo is_loading={is_loading} user={user} />}
    onClose={onRequestClose}
  >
    <ProfileMessages />
  </BetterScrollDialog>
);

const ProfileDialog = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileDialogUnconnected);

export { ProfileDialog };
