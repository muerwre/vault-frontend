import React, { VFC } from 'react';

import { PageTitle } from '~/components/common/PageTitle';
import { useNodeContext } from '~/utils/context/NodeContextProvider';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

interface NodeHeadMetadataProps {}

const NodeHeadMetadata: VFC<NodeHeadMetadataProps> = () => {
  const { node } = useNodeContext();

  return (
    <>
      <PageTitle title={getPageTitle(node.title)} />
    </>
  );
};

export { NodeHeadMetadata };
