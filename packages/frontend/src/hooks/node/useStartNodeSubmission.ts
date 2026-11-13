import { useCallback } from 'react';

import { features } from '~/constants/features';
import { Dialog } from '~/constants/modal';
import { URLS } from '~/constants/urls';
import { useAuth } from '~/hooks/auth/useAuth';
import { useShowModal } from '~/hooks/modal/useShowModal';
import { useNavigation } from '~/hooks/navigation/useNavigation';

/**
 * Starts creating a node of the given type: on its submission page when
 * superpowers are on and the feature is enabled, in the editor modal otherwise.
 * Reads observable auth state, so the caller must be an observer.
 */
export const useStartNodeSubmission = () => {
  const { isTester } = useAuth();
  const { push } = useNavigation();
  const showModal = useShowModal(Dialog.CreateNode);

  const usePages = isTester && features.submitPages;

  return useCallback(
    (type: string, isInLab: boolean) => {
      if (usePages) {
        push(URLS.SUBMIT(type, isInLab));
        return;
      }

      showModal({ type, isInLab });
    },
    [usePages, push, showModal],
  );
};
