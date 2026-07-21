import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { useAuth } from '~/hooks/auth/useAuth';

interface Props {}

const Superpower: FC<Props> = observer(({ children }) => {
  const { isTester } = useAuth();

  if (!isTester) return null;

  return <>{children}</>;
});

export { Superpower };
