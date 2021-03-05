import React, { FC, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { selectAuthProfile, selectAuthUser } from '~/redux/auth/selectors';
import styles from './styles.module.scss';
import * as AUTH_ACTIONS from '~/redux/messages/actions';
import { Message } from '~/components/profile/Message';
import { pick } from 'ramda';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { selectMessages } from '~/redux/messages/selectors';

const mapStateToProps = state => ({
  profile: selectAuthProfile(state),
  messages: selectMessages(state),
  user: pick(['id'], selectAuthUser(state)),
});

const mapDispatchToProps = {
  messagesGetMessages: AUTH_ACTIONS.messagesGetMessages,
  messagesRefreshMessages: AUTH_ACTIONS.messagesRefreshMessages,
  messagesDeleteMessage: AUTH_ACTIONS.messagesDeleteMessage,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const ProfileMessagesUnconnected: FC<IProps> = ({
  profile,
  messages,
  user: { id },
  messagesGetMessages,
  messagesDeleteMessage,
  messagesRefreshMessages,
}) => {
  const wasAtBottom = useRef(true);
  const [wrap, setWrap] = useState<HTMLDivElement | undefined>(undefined);
  const [editingMessageId, setEditingMessageId] = useState(0);

  const onEditMessage = useCallback((id: number) => setEditingMessageId(id), [setEditingMessageId]);
  const onCancelEdit = useCallback(() => setEditingMessageId(0), [setEditingMessageId]);
  const onDeleteMessage = useCallback((id: number) => messagesDeleteMessage(id, true), [
    messagesDeleteMessage,
  ]);
  const onRestoreMessage = useCallback((id: number) => messagesDeleteMessage(id, false), [
    messagesDeleteMessage,
  ]);

  useEffect(() => {
    if (profile.is_loading || !profile.user || !profile.user.username) return;

    messagesGetMessages(profile.user.username);
  }, [profile.user]);

  useEffect(() => {
    const timer = setInterval(messagesRefreshMessages, 20000);

    return () => clearTimeout(timer);
  }, [messagesRefreshMessages]);

  const storeRef = useCallback(
    (div: HTMLDivElement) => {
      if (!div || !div.parentElement) return;
      const parent = div.parentElement;
      parent.scrollTo(0, parent.scrollHeight);
      setWrap(div);
    },
    [setWrap]
  );

  useLayoutEffect(() => {
    const parent = wrap?.parentElement;

    if (!parent) return;

    if (wasAtBottom.current) {
      parent.scrollTo(0, parent.scrollHeight);
    }
  }, [messages.messages]);

  const onScroll = useCallback(() => {
    const parent = wrap?.parentElement;

    if (!parent) return;

    const scrollPos = parent.scrollTop + parent.clientHeight;
    wasAtBottom.current = parent.scrollHeight - scrollPos < 40;
  }, [wrap]);

  useEffect(() => {
    const parent = wrap?.parentElement;
    if (!parent) return;

    parent.addEventListener('scroll', onScroll);
    return () => parent.removeEventListener('scroll', onScroll);
  }, [wrap, onScroll]);

  if (!messages.messages.length || profile.is_loading)
    return <NodeNoComments is_loading={messages.is_loading_messages || profile.is_loading} />;

  if (messages.messages.length <= 0) {
    return null;
  }

  return (
    <div className={styles.messages} ref={storeRef}>
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
            onRestore={onRestoreMessage}
          />
        ))}

      {!messages.is_loading_messages && messages.messages.length > 0 && (
        <div className={styles.placeholder}>Когда-нибудь здесь будут еще сообщения</div>
      )}
    </div>
  );
};

const ProfileMessages = connect(mapStateToProps, mapDispatchToProps)(ProfileMessagesUnconnected);

export { ProfileMessages };
