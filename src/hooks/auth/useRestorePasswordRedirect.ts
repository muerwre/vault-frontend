import { useEffect } from 'react';
import { useModal } from '~/hooks/modal/useModal';
import { Dialog } from '~/constants/modal';
import { useNavigation } from '~/hooks/navigation/useNavigation';

/** redirects to the password redirect modal */
export const useRestorePasswordRedirect = () => {
  const { push } = useNavigation();
  const { showModal } = useModal();

  useEffect(() => {
    const match = window.location.pathname.match(/^\/restore\/([\w\d-]+)$/);

    if (!match?.[1]) {
      return;
    }

    push('/');
    showModal(Dialog.RestorePassword, { code: match[1] });
  }, [showModal, push]);
};
