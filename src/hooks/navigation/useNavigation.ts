import { useCallback } from 'react';
import { CONFIG } from '~/utils/config';
import { useRouter } from 'next/router';
import { useHistory } from 'react-router';

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
