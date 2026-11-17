import { FC } from 'react';

import { AdminTranscoding } from '~/containers/admin/AdminTranscoding';
import { AdminUsers } from '~/containers/admin/AdminUsers';
import { AdminSectionKey } from '~/containers/admin/sections';
import { AdminLayout } from '~/layouts/AdminLayout';

const SECTIONS: Record<AdminSectionKey, FC> = {
  users: AdminUsers,
  transcoding: AdminTranscoding,
};

interface Props {
  section: AdminSectionKey;
}

/** The admin page past its gate. Loaded on demand, so others never fetch it. */
const AdminPanel: FC<Props> = ({ section }) => {
  const Section = SECTIONS[section];

  return (
    <AdminLayout active={section}>
      <Section />
    </AdminLayout>
  );
};

export default AdminPanel;
