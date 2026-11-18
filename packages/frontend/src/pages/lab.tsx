import { PageTitle } from '~/components/common/PageTitle';
import { MembersOnly } from '~/containers/auth/MembersOnly';
import { LabLayout } from '~/layouts/LabLayout';
import { LabProvider } from '~/utils/providers/LabProvider';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

const LabPage = () => (
  <MembersOnly>
    <LabProvider>
      <PageTitle title={getPageTitle('Лаборатория')} />
      <LabLayout />
    </LabProvider>
  </MembersOnly>
);

export default LabPage;
