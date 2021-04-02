import React, { FC, Fragment, useCallback } from 'react';
import { Cell } from '~/components/flow/Cell';

import { IFlowState } from '~/redux/flow/reducer';
import { INode } from '~/redux/types';
import { canEditNode } from '~/utils/node';
import { IUser } from '~/redux/auth/types';
import { useHistory } from 'react-router';
import { URLS } from '~/constants/urls';

type IProps = Partial<IFlowState> & {
  user: Partial<IUser>;
  onChangeCellView: (id: INode['id'], flow: INode['flow']) => void;
};

export const FlowGrid: FC<IProps> = ({ user, nodes, onChangeCellView }) => {
  const history = useHistory();
  const onSelect = useCallback((id: INode['id']) => history.push(URLS.NODE_URL(id)), [history]);

  if (!nodes) {
    return null;
  }

  return (
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
};
