import { FC } from 'react';

import { Anchor } from '~/components/common/Anchor';
import { URLS } from '~/constants/urls';

import styles from './styles.module.scss';

interface Props {
  username?: string;
  className?: string;
}

/** Leads to a profile page; without a username, renders the children as is. */
const ProfileLink: FC<Props> = ({ username, className, children }) => {
  if (!username) {
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
};

export { ProfileLink };
