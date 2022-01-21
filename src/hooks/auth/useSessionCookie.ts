import { useEffect } from 'react';

import { autorun } from 'mobx';

import { useAuthStore } from '~/store/auth/useAuthStore';
import { setCookie } from '~/utils/dom/cookie';

export const useSessionCookie = () => {
  const auth = useAuthStore();

  useEffect(
    () =>
      autorun(() => {
        setCookie('session', auth.token, 30);
      }),
    [auth]
  );
};
