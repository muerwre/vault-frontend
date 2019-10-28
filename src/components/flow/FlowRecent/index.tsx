import React, { FC } from 'react';
import * as styles from './styles.scss';
import { IFlowState } from '~/redux/flow/reducer';

interface IProps {
  recent: IFlowState['recent'];
}

const FlowRecent: FC<IProps> = ({ recent }) => (
  <div className={styles.grid}>
    {recent &&
      recent.slice(0, 9).map(node => (
        <div key={node.id} className={styles.item}>
          <div className={styles.thumb} />
          <div className={styles.info}>{node.title}</div>
        </div>
      ))}
  </div>
);

export { FlowRecent };
