import React, { FC } from 'react';

import { useGetNodeRelated } from '~/hooks/node/useGetNodeRelated';
import { INode, ITag } from '~/types';
import { INodeRelated } from '~/types/node';
import { NodeRelatedContextProvider } from '~/utils/context/NodeRelatedContextProvider';

interface NodeRelatedProviderProps {
  id: INode['id'];
  tags?: ITag[];
}

const defaultValue: INodeRelated = {
  albums: {},
  similar: [],
};

const NodeRelatedProvider: FC<NodeRelatedProviderProps> = ({ id, children, tags }) => {
  const { related, isLoading } = useGetNodeRelated(id);

  return (
    <NodeRelatedContextProvider related={related || defaultValue} isLoading={isLoading}>
      {children}
    </NodeRelatedContextProvider>
  );
};

export { NodeRelatedProvider };
