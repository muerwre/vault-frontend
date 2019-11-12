import React, { FC, useEffect } from 'react';
import { connect } from 'react-redux';
import { selectAuthProfile } from '~/redux/auth/selectors';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import styles from './styles.scss';
import * as AUTH_ACTIONS from '~/redux/auth/actions';

const mapStateToProps = state => ({ profile: selectAuthProfile(state) });
const mapDispatchToProps = {
  authGetMessages: AUTH_ACTIONS.authGetMessages,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const ProfileMessagesUnconnected: FC<IProps> = ({ profile, authGetMessages }) => {
  useEffect(() => {
    if (profile.is_loading || !profile.user || !profile.user.username) return;

    authGetMessages(profile.user.username);
  }, [profile.user]);

  return (
    <div className={styles.messages}>
      {profile.messages.map(message => (
        <div key={message.id}>{message.text}</div>
      ))}
    </div>
  );
};

const ProfileMessages = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileMessagesUnconnected);

export { ProfileMessages };
