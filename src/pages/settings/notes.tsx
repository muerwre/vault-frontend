import React from 'react';

import { PageTitle } from '~/components/common/PageTitle';
import { SettingsNotes } from '~/containers/settings/SettingsNotes';
import { SettingsLayout } from '~/layouts/SettingsLayout';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

const SettingsNotesPage = () => (
  <div>
    <PageTitle title={getPageTitle('Лаборатория')} />

    <SettingsLayout>
      <SettingsNotes />
    </SettingsLayout>
  </div>
);

export default SettingsNotesPage;
