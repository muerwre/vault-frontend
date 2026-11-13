import { useCallback } from 'react';

import { features } from '~/constants/features';
import { Dialog } from '~/constants/modal';
import { URLS } from '~/constants/urls';
import { useShowModal } from '~/hooks/modal/useShowModal';
import { useNavigation } from '~/hooks/navigation/useNavigation';

/**
 * Starts creating a node of the given type: on its submission page, or in the
 * editor modal while `features.editorModals` is on.
 */
export const useStartNodeSubmission = () => {
  const { push } = useNavigation();
  const showModal = useShowModal(Dialog.CreateNode);

  const usePages = !features.editorModals;

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
