import React, { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { useGlobalLoader } from '~/hooks/dom/useGlobalLoader';
import { useFlow } from '~/hooks/flow/useFlow';
import { FlowLayout } from '~/layouts/FlowLayout';
import { FlowContextProvider } from '~/utils/context/FlowContextProvider';



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
      <FlowLayout isFluid={isFluid} onToggleLayout={toggleLayout} />
    </FlowContextProvider>
  );
});

export default FlowPage;
