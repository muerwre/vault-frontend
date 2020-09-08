import React, { FC, useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { selectAuthProfile, selectAuthUser } from '~/redux/auth/selectors';
import styles from './styles.scss';
import * as AUTH_ACTIONS from '~/redux/messages/actions';
import { Message } from '~/components/profile/Message';
import { Group } from '~/components/containers/Group';
import pick from 'ramda/es/pick';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { selectMessages } from '~/redux/messages/selectors';

const mapStateToProps = state => ({
  profile: selectAuthProfile(state),
  messages: selectMessages(state),
  user: pick(['id'], selectAuthUser(state)),
});

const mapDispatchToProps = {
  messagesGetMessages: AUTH_ACTIONS.messagesGetMessages,
  messagesDeleteMessage: AUTH_ACTIONS.messagesDeleteMessage,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const ProfileMessagesUnconnected: FC<IProps> = ({
  profile,
  messages,
  user: { id },
  messagesGetMessages,
  messagesDeleteMessage,
}) => {
  const [editingMessageId, setEditingMessageId] = useState(0);

  const onEditMessage = useCallback((id: number) => setEditingMessageId(id), [setEditingMessageId]);
  const onCancelEdit = useCallback(() => setEditingMessageId(0), [setEditingMessageId]);
  const onDeleteMessage = useCallback((id: number) => messagesDeleteMessage(id), [
    messagesDeleteMessage,
  ]);

  useEffect(() => {
    if (profile.is_loading || !profile.user || !profile.user.username) return;

    messagesGetMessages(profile.user.username);
  }, [profile.user]);

  useEffect(() => {
    if (profile.is_loading || !profile.user || !profile.user.username || messages.messages_error)
      return;

    const timer = setTimeout(() => messagesGetMessages(profile.user.username), 20000);

    return () => clearTimeout(timer);
  }, [profile.user, messages.messages]);

  if (!messages.messages.length || profile.is_loading)
    return <NodeNoComments is_loading={messages.is_loading_messages || profile.is_loading} />;

  return (
    <Group className={styles.messages}>
      {messages.messages
        .filter(message => !!message.text)
        .map((
          message // TODO: show files / memo
        ) => (
          <Message
            message={message}
            incoming={id !== message.from.id}
            key={message.id}
            onEdit={onEditMessage}
            onDelete={onDeleteMessage}
            isEditing={editingMessageId === message.id}
            onCancelEdit={onCancelEdit}
          />
        ))}

      {!messages.is_loading_messages && messages.messages.length > 0 && (
        <div className={styles.placeholder}>Когда-нибудь здесь будут еще сообщения</div>
      )}
    </Group>
  );
};

const ProfileMessages = connect(mapStateToProps, mapDispatchToProps)(ProfileMessagesUnconnected);

export { ProfileMessages };
