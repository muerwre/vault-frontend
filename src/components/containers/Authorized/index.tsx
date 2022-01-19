import React, { FC } from 'react';

import { useAuth } from '~/hooks/auth/useAuth';

interface IProps {}

const Authorized: FC<IProps> = ({ children }) => {
  const { isUser } = useAuth();

  if (!isUser) return null;

  return <>{children}</>;
};

export { Authorized };
