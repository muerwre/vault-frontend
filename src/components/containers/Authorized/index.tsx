import React, { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { useAuth } from '~/hooks/auth/useAuth';

interface IProps {
  // don't wait for user refetch, trust hydration
  hydratedOnly?: boolean;
}

const Authorized: FC<IProps> = observer(({ children, hydratedOnly }) => {
  const { isUser, fetched } = useAuth();

  if (!isUser || (!hydratedOnly && !fetched)) return null;

  return <>{children}</>;
});

export { Authorized };
