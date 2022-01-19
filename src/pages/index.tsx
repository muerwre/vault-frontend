import React, { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { PageTitle } from '~/components/common/PageTitle';
import { useGlobalLoader } from '~/hooks/dom/useGlobalLoader';
import { useFlow } from '~/hooks/flow/useFlow';
import { FlowLayout } from '~/layouts/FlowLayout';
import { FlowContextProvider } from '~/utils/context/FlowContextProvider';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

interface Props {}

const FlowPage: FC<Props> = observer(() => {
  useGlobalLoader();

  const {
    updates,
    nodes,
    heroes,
    recent,
    isFluid,
    toggleLayout,
    onChangeCellView,
    loadMore,
    isSyncing,
  } = useFlow();

  return (
    <FlowContextProvider
      updates={updates}
      recent={recent}
      heroes={heroes}
      nodes={nodes}
      loadMore={loadMore}
      isSyncing={isSyncing}
      onChangeCellView={onChangeCellView}
    >
      <PageTitle title={getPageTitle('Флоу')} />
      <FlowLayout isFluid={isFluid} onToggleLayout={toggleLayout} />
    </FlowContextProvider>
  );
});

export default FlowPage;
