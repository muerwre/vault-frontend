import React from 'react';

import { PageTitle } from '~/components/common/PageTitle';
import { SettingsLayout } from '~/layouts/SettingsLayout';
import { getPageTitle } from '~/utils/ssr/getPageTitle';
import { SettingsNotes } from '~/containers/settings/SettingsNotes';

const SettingsNotesPage = () => (
  <div>
    <PageTitle title={getPageTitle('Лаборатория')} />

    <SettingsLayout>
      <SettingsNotes />
    </SettingsLayout>
  </div>
);

export default SettingsNotesPage;
