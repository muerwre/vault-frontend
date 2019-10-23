import { api, configWithToken, resultMiddleware, errorMiddleware } from '~/utils/api';
import { INode, IResultWithStatus } from '../types';
import { API } from '~/constants/api';
import { flowSetCellView } from '~/redux/flow/actions';

export const postNode = ({
  access,
  node,
}: {
  access: string;
  node: INode;
}): Promise<IResultWithStatus<INode>> =>
  api
    .post(API.NODE.SAVE, { node }, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const getNodes = ({
  skip = 0,
}: {
  skip: number;
}): Promise<IResultWithStatus<{ nodes: INode[] }>> =>
  api
    .get(API.NODE.GET, { params: { skip } })
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const postCellView = ({
  id,
  flow,
  access,
}: ReturnType<typeof flowSetCellView> & { access: string }): Promise<
  IResultWithStatus<{ is_liked: INode['is_liked'] }>
> =>
  api
    .post(API.NODE.SET_CELL_VIEW(id), { flow }, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);
