import React, { FC } from 'react';
import { Cell } from '~/components/flow/Cell';

import * as styles from './styles.scss';
import { IFlowState } from '~/redux/flow/reducer';
import { INode } from '~/redux/types';
import { canEditNode } from '~/utils/node';
import { IUser } from '~/redux/auth/types';
import { flowSetCellView } from '~/redux/flow/actions';
import { FlowHero } from '../FlowHero';
import { FlowRecent } from '../FlowRecent';

type IProps = Partial<IFlowState> & {
  user: Partial<IUser>;
  onSelect: (id: INode['id'], type: INode['type']) => void;
  onChangeCellView: typeof flowSetCellView;
};

export const FlowGrid: FC<IProps> = ({
  user,
  nodes,
  heroes,
  recent,
  onSelect,
  onChangeCellView,
}) => (
  <div>
    <div className={styles.grid_test}>
      <div className={styles.hero}>
        <FlowHero heroes={heroes} />
      </div>
      <div className={styles.stamp}>
        <FlowRecent recent={recent} />
      </div>

      {nodes.map(node => (
        <Cell
          key={node.id}
          node={node}
          onSelect={onSelect}
          can_edit={canEditNode(node, user)}
          onChangeCellView={onChangeCellView}
        />
      ))}
    </div>
  </div>
);
