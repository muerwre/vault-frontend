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
        return nextRouter.push(url);
      }

      craHistory.push(url);

      return Promise.resolve();
    },
    [craHistory, nextRouter],
  );

  const replace = useCallback(
    (url: string) => {
      if (CONFIG.isNextEnvironment) {
        return nextRouter.replace(url);
      }

      craHistory.replace(url);

      return Promise.resolve();
    },
    [craHistory, nextRouter],
  );

  return { push, replace };
};
