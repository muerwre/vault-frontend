import { useCallback } from 'react';

import { URLS } from '~/constants/urls';
import { useNavigation } from '~/hooks/navigation/useNavigation';
import { INode } from '~/types';

// useGotoNode returns fn, that navigates to node
export const useGotoNode = (id: INode['id']) => {
  const { push } = useNavigation();
  return useCallback(() => push(URLS.NODE_URL(id)), [push, id]);
};
