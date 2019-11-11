import React, { FC } from 'react';
import { BetterScrollDialog } from '../BetterScrollDialog';
import styles from './styles.scss';
import { ProfileInfo } from '~/containers/profile/ProfileInfo';
import { IDialogProps } from '~/redux/types';
import { connect } from 'react-redux';
import { selectAuthProfile } from '~/redux/auth/selectors';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { CommentForm } from '~/components/node/CommentForm';

const mapStateToProps = selectAuthProfile;
const mapDispatchToProps = {};

type IProps = IDialogProps & ReturnType<typeof mapStateToProps> & {};

const ProfileDialogUnconnected: FC<IProps> = ({ onRequestClose, is_loading, user }) => (
  <BetterScrollDialog
    header={<ProfileInfo is_loading={is_loading} user={user} />}
    footer={<CommentForm id="0" />}
    onClose={onRequestClose}
  >
    <div className={styles.messages}>
      <NodeNoComments />
      <NodeNoComments />
      <NodeNoComments />
    </div>
  </BetterScrollDialog>
);

const ProfileDialog = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileDialogUnconnected);

export { ProfileDialog };
