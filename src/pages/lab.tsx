import React, { VFC } from 'react';

import { PageTitle } from '~/components/common/PageTitle';
import { LabLayout } from '~/layouts/LabLayout';
import { LabProvider } from '~/utils/providers/LabProvider';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

interface LabPageProps {}

const LabPage: VFC<LabPageProps> = () => (
  <LabProvider>
    <PageTitle title={getPageTitle('Лаборатория')} />
    <LabLayout />
  </LabProvider>
);

export default LabPage;
