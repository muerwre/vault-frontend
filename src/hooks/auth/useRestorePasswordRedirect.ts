import { useEffect } from 'react';
import { useHistory } from 'react-router';
import { useModal } from '~/hooks/modal/useModal';
import { Dialog } from '~/constants/modal';

/** redirects to the password redirect modal */
export const useRestorePasswordRedirect = () => {
  const history = useHistory();
  const { showModal } = useModal();

  useEffect(() => {
    const match = window.location.pathname.match(/^\/restore\/([\w\d-]+)$/);

    if (!match?.[1]) {
      return;
    }

    history.push('/');
    showModal(Dialog.RestorePassword, { code: match[1] });
  }, [showModal, history]);
};
