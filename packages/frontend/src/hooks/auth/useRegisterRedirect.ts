import { useEffect } from 'react';

import { Dialog } from '~/constants/modal';
import { useModal } from '~/hooks/modal/useModal';
import { useNavigation } from '~/hooks/navigation/useNavigation';

/** Opens the mailed registration link (`/register/:code`) as a dialog. */
export const useRegisterRedirect = () => {
  const { push } = useNavigation();
  const { showModal } = useModal();

  useEffect(() => {
    const match = window.location.pathname.match(/^\/register\/([\w-]+)\/?$/);

    if (!match?.[1]) {
      return;
    }

    push('/');
    showModal(Dialog.RegisterComplete, { code: match[1] });
  }, [showModal, push]);
};
