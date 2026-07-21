import { useMemo } from 'react';

import { useAuth } from '~/hooks/auth/useAuth';

export const useSuperPowers = () => {
  const { isTester, setIsTester } = useAuth();

  return useMemo(() => ({ isTester, setIsTester }), [isTester, setIsTester]);
};
