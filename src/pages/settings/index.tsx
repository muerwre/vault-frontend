import React from 'react';

import { PageTitle } from '~/components/common/PageTitle';
import { ProfileSettings } from '~/components/profile/ProfileSettings';
import { SettingsLayout } from '~/layouts/SettingsLayout';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

const SettingsPage = () => (
  <div>
    <PageTitle title={getPageTitle('Лаборатория')} />

    <SettingsLayout>
      <ProfileSettings />
    </SettingsLayout>
  </div>
);

export default SettingsPage;
