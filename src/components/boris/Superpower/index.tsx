import React, { FC } from 'react';
import { useShallowSelect } from '~/hooks/data/useShallowSelect';
import { selectAuthIsTester, selectUser } from '~/redux/auth/selectors';

interface IProps {}

const Superpower: FC<IProps> = ({ children }) => {
  const user = useShallowSelect(selectUser);
  const is_tester = useShallowSelect(selectAuthIsTester);

  if (!user.is_user || !is_tester) return null;

  return <>{children}</>;
};

export { Superpower };
