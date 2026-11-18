import { FC } from 'react';

import { useRouter } from 'next/router';

import { PageTitle } from '~/components/common/PageTitle';
import { useGlobalLoader } from '~/hooks/dom/useGlobalLoader';
import { ProfileLayout } from '~/layouts/ProfileLayout';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

/**
 * Reached as `/~username` through a rewrite. Open to everyone; only the links
 * that lead here are kept behind superpowers.
 */
const ProfilePage: FC = () => {
  const { query } = useRouter();
  const username = (query.username as string) || '';

  useGlobalLoader();

  return (
    <>
      <PageTitle title={getPageTitle(username ? `~${username}` : '')} />
      <ProfileLayout username={username} />
    </>
  );
};

export default ProfilePage;
