import { useCallback } from 'react';

import { Dialog } from '~/constants/modal/dialog';
import { useShowModal } from '~/hooks/modal/useShowModal';

/**
 * Opens the register dialog for a guest who tried something only members can
 * do, as a comment or a like does. `reason` names it in analytics. The modal
 * layer keeps it from ever opening for a logged-in user.
 */
export const useAskToLogIn = (reason: string) => {
  const showRegisterDialog = useShowModal(Dialog.Register);

  return useCallback(() => {
    umami.track(`register-dialog-from-${reason}`);
    showRegisterDialog({});
  }, [reason, showRegisterDialog]);
};
