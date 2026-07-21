import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { useAuth } from '~/hooks/auth/useAuth';

interface Props {
  // don't wait for user refetch, trust hydration
  hydratedOnly?: boolean;
}

const Authorized: FC<Props> = observer(({ children, hydratedOnly }) => {
  const { isUser, fetched } = useAuth();

  if (!isUser || (!hydratedOnly && !fetched)) return null;

  return <>{children}</>;
});

export { Authorized };
