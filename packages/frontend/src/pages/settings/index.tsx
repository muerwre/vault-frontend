import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { PageTitle } from '~/components/common/PageTitle';
import { useAuth } from '~/hooks/auth/useAuth';
import { useGlobalLoader } from '~/hooks/dom/useGlobalLoader';
import { NotFoundLayout } from '~/layouts/NotFoundLayout';
import { ProfileSettingsLayout } from '~/layouts/ProfileSettingsLayout';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

/**
 * The viewer's own settings. To guests the page does not exist. An observer:
 * the auth store's `fetched` flips after the user loads.
 */
const SettingsPage: FC = observer(() => {
  const { isUser, fetched, user } = useAuth();

  useGlobalLoader();

  if (!isUser) {
    return <NotFoundLayout />;
  }

  // the form starts from the loaded user
  if (!fetched) {
    return null;
  }

  return (
    <>
      <PageTitle title={getPageTitle('Настройки')} />
      <ProfileSettingsLayout username={user.username} />
    </>
  );
});

export default SettingsPage;
