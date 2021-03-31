import { INode } from '~/redux/types';
import { useHistory } from 'react-router';
import { useCallback } from 'react';
import { URLS } from '~/constants/urls';

// useGotoNode returns fn, that navigates to node
export const useGotoNode = (id: INode['id']) => {
  const history = useHistory();
  return useCallback(() => history.push(URLS.NODE_URL(id)), [id]);
};
