import React, { FC } from 'react';
import { Cell } from '~/components/flow/Cell';

import * as styles from './styles.scss';
import { IFlowState } from '~/redux/flow/reducer';
import { INode } from '~/redux/types';

type IProps = Partial<IFlowState> & {
  onSelect: (id: INode['id'], type: INode['type']) => void;
};

export const FlowGrid: FC<IProps> = ({ nodes, onSelect }) => (
  <div>
    <div className={styles.grid_test}>
      <div className={styles.hero}>HERO</div>
      <div className={styles.stamp}>STAMP</div>

      {nodes.map(node => (
        <Cell key={node.id} node={node} onSelect={onSelect} />
      ))}
    </div>
  </div>
);

// {
//   range(1, 20).map(el => (
//     <Cell
//       width={Math.floor(Math.random() * 2 + 1)}
//       height={Math.floor(Math.random() * 2 + 1)}
//       title={`Cell ${el}`}
//       key={el}
//     />
//   ));
// }
