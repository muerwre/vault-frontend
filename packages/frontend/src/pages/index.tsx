import { FC } from 'react';

import { observer } from 'mobx-react-lite';
import { InferGetStaticPropsType } from 'next';

import { getNodeDiff } from '~/api/node';
import { PageTitle } from '~/components/common/PageTitle';
import { useGlobalLoader } from '~/hooks/dom/useGlobalLoader';
import { FlowLayout } from '~/layouts/FlowLayout';
import { FlowProvider } from '~/utils/providers/FlowProvider';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

/**
 * First-paint flow data. The page is also generated during `next build`, where
 * no backend need be reachable: then it ships empty and regenerates shortly
 * after start, while the client loads the flow itself either way.
 */
export const getStaticProps = async () => {
  try {
    const fallbackData = await getNodeDiff({
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      with_heroes: true,
      with_updated: true,
      with_recent: true,
      with_valid: false,
    });

    return {
      props: { fallbackData },
      revalidate: 60 * 60, // every hour
    };
  } catch (error) {
    console.warn(
      "[NEXT] can't load the flow, serving it empty for now:",
      error,
    );

    return {
      // null, not undefined: page props must serialise as JSON.
      props: { fallbackData: null },
      revalidate: 10,
    };
  }
};

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const FlowPage: FC<Props> = observer(({ fallbackData }) => {
  useGlobalLoader();

  return (
    <FlowProvider fallbackData={fallbackData ?? undefined}>
      <PageTitle title={getPageTitle('Флоу')} />
      <FlowLayout />
    </FlowProvider>
  );
});

export default FlowPage;
