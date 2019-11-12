import React, { FC, useEffect } from 'react';
import { connect } from 'react-redux';
import { selectAuthProfile, selectAuth, selectAuthUser } from '~/redux/auth/selectors';
import styles from './styles.scss';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { Message } from '~/components/profile/Message';
import { Group } from '~/components/containers/Group';
import pick from 'ramda/es/pick';
import { NodeNoComments } from '~/components/node/NodeNoComments';

const mapStateToProps = state => ({
  profile: selectAuthProfile(state),
  user: pick(['id'], selectAuthUser(state)),
});

const mapDispatchToProps = {
  authGetMessages: AUTH_ACTIONS.authGetMessages,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const ProfileMessagesUnconnected: FC<IProps> = ({ profile, user: { id }, authGetMessages }) => {
  useEffect(() => {
    if (profile.is_loading || !profile.user || !profile.user.username) return;

    authGetMessages(profile.user.username);
  }, [profile.user]);

  useEffect(() => {
    if (profile.is_loading || !profile.user || !profile.user.username || profile.messages_error)
      return;

    const timer = setTimeout(() => authGetMessages(profile.user.username), 20000);

    return () => clearTimeout(timer);
  }, [profile.user, profile.messages]);

  if (!profile.messages.length || profile.is_loading)
    return <NodeNoComments is_loading={profile.is_loading_messages || profile.is_loading} />;

  return (
    <Group className={styles.messages}>
      {profile.messages
        .filter(message => !!message.text)
        .map((
          message // TODO: show files / memo
        ) => (
          <Message message={message} incoming={id !== message.from.id} key={message.id} />
        ))}

      {!profile.is_loading_messages && profile.messages.length > 0 && (
        <div className={styles.placeholder}>Когда-нибудь здесь будут еще сообщения</div>
      )}
    </Group>
  );
};

const ProfileMessages = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileMessagesUnconnected);

export { ProfileMessages };
