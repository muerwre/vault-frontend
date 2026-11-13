import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { URLS } from '~/constants/urls';
import { useAuthStore } from '~/store/auth/useAuthStore';

/**
 * Keeps a page to signed-in users: once the stored login is restored and there
 * is none (or the user logs out there), sends the visitor to the main page.
 * Returns whether the page may render. The caller must be an observer.
 */
export const useUsersOnly = () => {
  const { replace } = useRouter();
  const { isHydrated, isUser } = useAuthStore();

  const isGuest = isHydrated && !isUser;

  useEffect(() => {
    if (isGuest) {
      void replace(URLS.BASE);
    }
  }, [isGuest, replace]);

  return isHydrated && isUser;
};
