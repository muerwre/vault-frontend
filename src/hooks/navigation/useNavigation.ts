import { useCallback } from 'react';

import { useRouter } from 'next/router';
import { useHistory } from 'react-router';

import { CONFIG } from '~/utils/config';

export const useNavigation = () => {
  const nextRouter = useRouter();
  const craHistory = useHistory();

  const push = useCallback(
    (url: string) => {
      if (CONFIG.isNextEnvironment) {
        nextRouter.push(url);
      } else {
        craHistory.push(url);
      }
    },
    [craHistory, nextRouter]
  );

  return { push };
};
