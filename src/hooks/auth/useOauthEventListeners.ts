import { useEffect } from 'react';

import { EventMessageType } from '~/constants/events';
import { useAuth } from '~/hooks/auth/useAuth';
import { useOAuth } from '~/hooks/auth/useOAuth';
import { useModal } from '~/hooks/modal/useModal';
import { includes, path, values } from '~/utils/ramda';
import { showToastError } from '~/utils/toast';

/** reacts to events passed by window.postMessage */
export const useOauthEventListeners = () => {
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
          loginWithSocial(path(['data', 'payload', 'token'], event));
          break;
        case EventMessageType.OAuthProcessed:
          if (isUser) {
            void attachAccount(path(['data', 'payload', 'token'], event));
          } else {
            void createSocialAccount(path(['data', 'payload', 'token'], event));
          }
          break;
        case EventMessageType.OAuthError:
          const message = path(['data', 'payload', 'error'], event);
          if (message && typeof message === 'string') {
            showToastError(message);
          }
          break;
        default:
          console.log('unknown message', event.data);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [attachAccount, createSocialAccount, loginWithSocial, isUser, showModal]);
};
