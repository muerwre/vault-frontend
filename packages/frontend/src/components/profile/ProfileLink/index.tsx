import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { Anchor } from '~/components/common/Anchor';
import { URLS } from '~/constants/urls';
import { useSuperPowers } from '~/hooks/auth/useSuperPowers';

import styles from './styles.module.scss';

interface Props {
  username?: string;
  className?: string;
}

/**
 * Leads to a profile page, for viewers with superpowers only. Everyone else
 * gets the children as plain text; the page itself stays open to all.
 */
const ProfileLink: FC<Props> = observer(({ username, className, children }) => {
  const { isTester } = useSuperPowers();

  if (!isTester || !username) {
    return <>{children}</>;
  }

  return (
    <Anchor
      href={URLS.PROFILE_PAGE(username)}
      className={className ?? styles.link}
    >
      {children}
    </Anchor>
  );
});

export { ProfileLink };
