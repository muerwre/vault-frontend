import React, { FC } from 'react';
import { INode } from '~/redux/types';
import { NodeRelatedContextProvider } from '~/utils/context/NodeRelatedContextProvider';
import { ApiGetNodeRelatedResult, INodeRelated } from '~/redux/node/types';
import useSWR from 'swr';
import { API } from '~/constants/api';
import { api } from '~/utils/api';
import { AxiosResponse } from 'axios';

interface NodeRelatedProviderProps {
  id: INode['id'];
}

const defaultValue: INodeRelated = {
  albums: {},
  similar: [],
};

const NodeRelatedProvider: FC<NodeRelatedProviderProps> = ({ id, children }) => {
  const { data, isValidating } = useSWR<AxiosResponse<ApiGetNodeRelatedResult>>(
    API.NODE.RELATED(id),
    api.get
  );

  return (
    <NodeRelatedContextProvider
      related={data?.data?.related || defaultValue}
      isLoading={isValidating}
    >
      {children}
    </NodeRelatedContextProvider>
  );
};

export { NodeRelatedProvider };
