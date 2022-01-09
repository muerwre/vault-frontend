import { useEffect } from 'react';
import { EventMessageType } from '~/constants/events';
import { includes, path, values } from 'ramda';
import { useOAuth } from '~/hooks/auth/useOAuth';
import { Dialog } from '~/constants/modal';
import { useModal } from '~/hooks/modal/useModal';
import { useAuth } from '~/hooks/auth/useAuth';

/** reacts to events passed by window.postMessage */
export const useMessageEventReactions = () => {
  const { loginWithSocial, createSocialAccount, attachAccount } = useOAuth();
  const { showModal } = useModal();
  const { isUser } = useAuth();

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const type: EventMessageType | undefined = path(['data', 'type'], event);

      if (!type || !includes(type, values(EventMessageType))) {
        return;
      }

      console.log('caught event:', type, event.data);

      switch (type) {
        case EventMessageType.OAuthLogin:
          // TODO: do we really need it?
          loginWithSocial(path(['data', 'payload', 'token'], event));
          break;
        case EventMessageType.OAuthProcessed:
          if (isUser) {
            void attachAccount(path(['data', 'payload', 'token'], event));
          } else {
            void createSocialAccount(path(['data', 'payload', 'token'], event));
          }
          break;
        case EventMessageType.OpenProfile:
          const username: string | undefined = path(['data', 'username'], event);
          if (!username) {
            return;
          }

          showModal(Dialog.Profile, { username });
          break;
        default:
          console.log('unknown message', event.data);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [attachAccount, createSocialAccount, loginWithSocial, isUser, showModal]);
};
