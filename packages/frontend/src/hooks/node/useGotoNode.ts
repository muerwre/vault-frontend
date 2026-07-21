import { useCallback } from 'react';

import { URLS } from '~/constants/urls';
import { useNavigation } from '~/hooks/navigation/useNavigation';

// useGotoNode returns fn, that navigates to node
export const useGotoNode = (id?: number) => {
  const { push } = useNavigation();
  return useCallback(() => {
    if (!id) {
      return;
    }

    push(URLS.NODE_URL(id));
  }, [push, id]);
};
