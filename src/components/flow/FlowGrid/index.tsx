import React, { FC, Fragment } from 'react';
import { Cell } from '~/components/flow/Cell';

import { IFlowState } from '~/redux/flow/reducer';
import { INode } from '~/redux/types';
import { canEditNode } from '~/utils/node';
import { IUser } from '~/redux/auth/types';
import { flowSetCellView } from '~/redux/flow/actions';

type IProps = Partial<IFlowState> & {
  user: Partial<IUser>;
  onSelect: (id: INode['id'], type: INode['type']) => void;
  onChangeCellView: typeof flowSetCellView;
};

export const FlowGrid: FC<IProps> = ({ user, nodes, onSelect, onChangeCellView }) => (
  <Fragment>
    {nodes.map(node => (
      <Cell
        key={node.id}
        node={node}
        onSelect={onSelect}
        can_edit={canEditNode(node, user)}
        onChangeCellView={onChangeCellView}
      />
    ))}
  </Fragment>
);
