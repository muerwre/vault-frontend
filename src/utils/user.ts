import { EventMessageType } from '~/constants/events';

export const openUserProfile = (username?: string) => {
  if (!username) {
    return;
  }

  window.postMessage({ type: EventMessageType.OpenProfile, username }, '*');
};
