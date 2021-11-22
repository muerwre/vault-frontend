import React, { FC, useEffect } from 'react';
import { INode, ITag } from '~/redux/types';
import { NodeRelatedContextProvider } from '~/utils/context/NodeRelatedContextProvider';
import { INodeRelated } from '~/redux/node/types';
import { useGetNodeRelated } from '~/utils/hooks/data/useGetNodeRelated';

interface NodeRelatedProviderProps {
  id: INode['id'];
  tags?: ITag[];
}

const defaultValue: INodeRelated = {
  albums: {},
  similar: [],
};

const NodeRelatedProvider: FC<NodeRelatedProviderProps> = ({ id, children, tags }) => {
  const { related, isLoading, refresh } = useGetNodeRelated(id);

  useEffect(
    () => {
      refresh();
    },
    // eslint-disable-next-line
    [tags]
  );

  return (
    <NodeRelatedContextProvider related={related || defaultValue} isLoading={isLoading}>
      {children}
    </NodeRelatedContextProvider>
  );
};

export { NodeRelatedProvider };
