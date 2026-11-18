import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { useIsMounted } from '~/hooks/dom/useIsMounted';
import { NotFoundLayout } from '~/layouts/NotFoundLayout';
import { useAuthStore } from '~/store/auth/useAuthStore';

/**
 * Members-only page: a guest gets the 404 page, as the api answers them.
 *
 * The server has no stored login, so it renders nothing here, and so does the
 * first client render; only then is the login consulted. Otherwise the server's
 * 404 and the member's page would be merged during hydration.
 */
const MembersOnly: FC = observer(({ children }) => {
  const isMounted = useIsMounted();
  const { isHydrated, isUser } = useAuthStore();

  if (!isMounted || !isHydrated) {
    return null;
  }

  if (!isUser) {
    return <NotFoundLayout />;
  }

  return <>{children}</>;
});

export { MembersOnly };
