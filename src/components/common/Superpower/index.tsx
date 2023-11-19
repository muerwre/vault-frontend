import React, { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { useAuth } from '~/hooks/auth/useAuth';

interface IProps {}

const Superpower: FC<IProps> = observer(({ children }) => {
  const { isTester } = useAuth();

  if (!isTester) return null;

  return <>{children}</>;
});

export { Superpower };
