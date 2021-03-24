import React, { FC } from 'react';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectUser } from '~/redux/auth/selectors';

interface IProps {}

const Authorized: FC<IProps> = ({ children }) => {
  const user = useShallowSelect(selectUser);

  if (!user.is_user) return null;

  return <>{children}</>;
};

export { Authorized };
