import { api, configWithToken, resultMiddleware, errorMiddleware } from '~/utils/api';
import { INode } from '../types';
import { API } from '~/constants/api';

export const postNode = ({ 
  access,
  data,
}: {
  access: string,
  data: INode,
}) => (
  api.post(API.NODE.SAVE, { data }, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware)
);
