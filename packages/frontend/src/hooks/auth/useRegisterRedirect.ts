import { useEffect, useRef } from 'react';

import { Dialog } from '~/constants/modal/dialog';
import { useModal } from '~/hooks/modal/useModal';
import { useNavigation } from '~/hooks/navigation/useNavigation';
import { useAuthStore } from '~/store/auth/useAuthStore';

const REGISTER_PATH = /^\/register\/([\w-]+)\/?$/;

/**
 * Opens the mailed registration link (`/register/:code`) as a dialog, for
 * guests only. A signed-in user is left on the page, which has no route and
 * so renders as a 404.
 */
export const useRegisterRedirect = () => {
  const { push } = useNavigation();
  const { showModal } = useModal();
  const { isHydrated, isUser } = useAuthStore();
  const handled = useRef(false);

  useEffect(() => {
    // The session is read from storage; until then a user looks like a guest.
    if (handled.current || !isHydrated) {
      return;
    }

    const match = window.location.pathname.match(REGISTER_PATH);

    if (!match?.[1]) {
      return;
    }

    handled.current = true;

    if (isUser) {
      return;
    }

    push('/');
    showModal(Dialog.RegisterComplete, { code: match[1] });
  }, [showModal, push, isHydrated, isUser]);
};
