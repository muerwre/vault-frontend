import { FC, useEffect } from 'react';

import { useRouter } from 'next/router';

import { URLS } from '~/constants/urls';
import { useGlobalLoader } from '~/hooks/dom/useGlobalLoader';
import { ProfileLayout } from '~/layouts/ProfileLayout';

/**
 * Reached as `/@username` through a rewrite. The layout sets the page title
 * once the profile has loaded.
 */
const ProfilePage: FC = () => {
  const { query, replace } = useRouter();
  const typed = (query.username as string) || '';
  const username = typed.toLocaleLowerCase();

  useGlobalLoader();

  // a mixed-case address, typed or from an old link, settles on the lowercase one
  useEffect(() => {
    if (typed && typed !== username) {
      void replace(URLS.PROFILE_PAGE(username));
    }
  }, [typed, username, replace]);

  return <ProfileLayout username={username} />;
};

export default ProfilePage;
