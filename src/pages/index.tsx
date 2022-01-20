import React, { FC } from 'react';

import { observer } from 'mobx-react-lite';
import { InferGetStaticPropsType } from 'next';

import { getNodeDiff } from '~/api/node';
import { PageTitle } from '~/components/common/PageTitle';
import { useGlobalLoader } from '~/hooks/dom/useGlobalLoader';
import { FlowLayout } from '~/layouts/FlowLayout';
import { FlowProvider } from '~/utils/providers/FlowProvider';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

export const getStaticProps = async () => {
  const fallbackData = await getNodeDiff({
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    with_heroes: true,
    with_updated: true,
    with_recent: false,
    with_valid: false,
  });

  return {
    props: {
      fallbackData,
    },
    revalidate: 5 * 60,
  };
};

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const FlowPage: FC<Props> = observer(({ fallbackData }) => {
  useGlobalLoader();

  return (
    <FlowProvider fallbackData={fallbackData}>
      <PageTitle title={getPageTitle('Флоу')} />
      <FlowLayout />
    </FlowProvider>
  );
});

export default FlowPage;
