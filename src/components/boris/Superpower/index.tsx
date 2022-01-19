import React, { FC } from 'react';

import { useAuth } from '~/hooks/auth/useAuth';

interface IProps {}

const Superpower: FC<IProps> = ({ children }) => {
  const { isTester } = useAuth();

  if (!isTester) return null;

  return <>{children}</>;
};

export { Superpower };
