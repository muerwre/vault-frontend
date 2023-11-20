import { FC } from 'react';

import { useRouter } from 'next/router';
import { RouteComponentProps } from 'react-router';

import { PageTitle } from '~/components/common/PageTitle';
import { useGlobalLoader } from '~/hooks/dom/useGlobalLoader';
import { ProfileLayout } from '~/layouts/ProfileLayout';
import { FlowProvider } from '~/utils/providers/FlowProvider';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

type ProfilePageProps = RouteComponentProps<{ username: string }>;

const ProfilePage: FC<ProfilePageProps> = () => {
  const { query } = useRouter();

  useGlobalLoader();

  return (
    <FlowProvider>
      <PageTitle title={getPageTitle('Флоу')} />
      <ProfileLayout username={query.username as string} />
    </FlowProvider>
  );
};

export default ProfilePage;
