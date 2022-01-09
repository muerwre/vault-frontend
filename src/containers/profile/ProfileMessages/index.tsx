import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Message } from '~/components/profile/Message';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { useMessages } from '~/hooks/messages/useMessages';
import { useUser } from '~/hooks/auth/useUser';
import { useProfileContext } from '~/utils/providers/ProfileProvider';

const ProfileMessages: FC = () => {
  const { profile, isLoading: isLoadingProfile } = useProfileContext();
  const { user } = useUser();
  const { messages, isLoading: isLoadingMessages } = useMessages(profile?.username || '');

  if (!messages.length || isLoadingProfile)
    return <NodeNoComments is_loading={isLoadingMessages || isLoadingProfile} />;

  if (messages.length <= 0) {
    return null;
  }

  return (
    <div className={styles.messages}>
      <div className={styles.warning}>
        <p>В будущем мы собираемся убрать сообщения, превратив их в заметки.</p>

        <p>
          Вся твоя история сообщений, написанных себе, сохранится. Исчезнут только сообщения другим
          участникам.
        </p>

        <p>
          Давай обсудим это в <a href="/boris">Борисе</a>, если это так важно.
        </p>
      </div>

      {messages
        .filter(message => !!message.text)
        .map((
          message // TODO: show files / memo
        ) => (
          <Message message={message} incoming={user.id !== message.from.id} key={message.id} />
        ))}

      {!isLoadingMessages && messages.length > 0 && (
        <div className={styles.placeholder}>Когда-нибудь здесь будут еще сообщения</div>
      )}
    </div>
  );
};

export { ProfileMessages };
