import React from 'react';

import { PageTitle } from '~/components/common/PageTitle';
import { SettingsDeleted } from '~/containers/settings/SettingsDeleted';
import { SettingsLayout } from '~/layouts/SettingsLayout';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

const SettingsDeletedPage = () => (
  <div>
    <PageTitle title={getPageTitle('Лаборатория')} />

    <SettingsLayout>
      <SettingsDeleted />
    </SettingsLayout>
  </div>
);

export default SettingsDeletedPage;
