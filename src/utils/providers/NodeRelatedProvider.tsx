import React, { FC } from 'react';
import { INode } from '~/redux/types';
import { NodeRelatedContextProvider } from '~/utils/context/NodeRelatedContextProvider';
import { INodeRelated } from '~/redux/node/types';
import { useGetNodeRelated } from '~/utils/hooks/data/useGetNodeRelated';

interface NodeRelatedProviderProps {
  id: INode['id'];
}

const defaultValue: INodeRelated = {
  albums: {},
  similar: [],
};

const NodeRelatedProvider: FC<NodeRelatedProviderProps> = ({ id, children }) => {
  const { related, isLoading } = useGetNodeRelated(id);

  return (
    <NodeRelatedContextProvider related={related || defaultValue} isLoading={isLoading}>
      {children}
    </NodeRelatedContextProvider>
  );
};

export { NodeRelatedProvider };
