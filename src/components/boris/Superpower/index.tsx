import React, { FC, memo } from 'react';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectAuthIsTester, selectUser } from '~/redux/auth/selectors';

interface IProps {}

const Superpower: FC<IProps> = memo(({ children }) => {
  const user = useShallowSelect(selectUser);
  const is_tester = useShallowSelect(selectAuthIsTester);

  if (!user || !is_tester) return null;

  return <>{children}</>;
});

export { Superpower };
