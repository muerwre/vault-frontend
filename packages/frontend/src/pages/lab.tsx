import { observer } from 'mobx-react-lite';

import { PageTitle } from '~/components/common/PageTitle';
import { LabLayout } from '~/layouts/LabLayout';
import { NotFoundLayout } from '~/layouts/NotFoundLayout';
import { useAuthStore } from '~/store/auth/useAuthStore';
import { LabProvider } from '~/utils/providers/LabProvider';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

/**
 * Members only: a guest gets the 404 page, as the lab's api answers them.
 * Nothing renders until the stored login is restored, so a member never sees
 * the 404 flash by.
 */
const LabPage = observer(() => {
  const { isHydrated, isUser } = useAuthStore();

  if (!isHydrated) {
    return null;
  }

  if (!isUser) {
    return <NotFoundLayout />;
  }

  return (
    <LabProvider>
      <PageTitle title={getPageTitle('Лаборатория')} />
      <LabLayout />
    </LabProvider>
  );
});

export default LabPage;
