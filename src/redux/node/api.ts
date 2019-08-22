import { api, configWithToken, resultMiddleware, errorMiddleware } from '~/utils/api';
import { INode, IResultWithStatus } from '../types';
import { API } from '~/constants/api';

export const postNode = ({ 
  access,
  node,
}: {
  access: string,
  node: INode,
}): Promise<IResultWithStatus<INode>> => (
  api.post(API.NODE.SAVE, { node }, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware)
);
