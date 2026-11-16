import { FC } from 'react';

import { observer } from 'mobx-react-lite';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { LoaderScreen } from '~/components/common/LoaderScreen';
import { PageTitle } from '~/components/common/PageTitle';
import { ADMIN_SECTIONS, AdminSectionKey } from '~/containers/admin/sections';
import { useAdminGate } from '~/hooks/auth/useAdminGate';
import { NotFoundLayout } from '~/layouts/NotFoundLayout';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

/** Its code is fetched only once the visitor turned out to be an admin. */
const AdminPanel = dynamic(() => import('~/containers/admin/AdminPanel'), {
  ssr: false,
  loading: () => <LoaderScreen />,
});

/**
 * `/admin` and `/admin/<section>`. Anyone but an admin sees the ordinary 404
 * page at once; an admin is checked against the server first.
 */
const AdminPage: FC = observer(() => {
  const router = useRouter();
  const gate = useAdminGate();

  const [requested] = (router.query.section as string[] | undefined) ?? [];
  const section = requested
    ? ADMIN_SECTIONS.find((item) => item.key === requested)?.key
    : ADMIN_SECTIONS[0].key;

  if (!router.isReady || gate === 'pending') {
    return null;
  }

  if (gate === 'denied' || !section) {
    return <NotFoundLayout />;
  }

  return (
    <>
      <PageTitle title={getPageTitle('Управление')} />
      <AdminPanel section={section as AdminSectionKey} />
    </>
  );
});

export default AdminPage;
