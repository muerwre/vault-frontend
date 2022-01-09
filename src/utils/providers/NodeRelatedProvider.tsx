import React, { FC, useEffect } from 'react';
import { INode, ITag } from '~/types';
import { NodeRelatedContextProvider } from '~/utils/context/NodeRelatedContextProvider';
import { INodeRelated } from '~/types/node';
import { useGetNodeRelated } from '~/hooks/node/useGetNodeRelated';

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
