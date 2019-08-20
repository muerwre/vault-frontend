import * as React from 'react';
import { range } from 'ramda';
import { Cell } from '~/components/flow/Cell';

import * as styles from './styles.scss';

export const TestGrid = () => (
  <div>
    <div className={styles.grid_test}>
      <div className={styles.hero}>HERO</div>

      <div className={styles.stamp}>STAMP</div>

      {range(1, 20).map(el => (
        <Cell
          width={Math.floor(Math.random() * 2 + 1)}
          height={Math.floor(Math.random() * 2 + 1)}
          title={`Cell ${el}`}
          key={el}
        />
      ))}
    </div>
  </div>
);
