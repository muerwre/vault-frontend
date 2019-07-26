import * as React from 'react';
import { Cell } from "~/components/flow/Cell";
import { range } from 'ramda';

import * as styles from './styles.scss';

export const TestGrid = () => (
  <div className={styles.grid_test}>
    <div style={{
      gridRow: '1 / 2',
      gridColumn: '1 / -1',
      background: 'green',
    }}
    >
      HERO
    </div>

    <div style={{
      gridRow: '2 / 4',
      gridColumn: '-2 / -1',
      background: 'blue',
    }}
    >
      STAMP
    </div>

    {
      range(1,20).map(el => (
        <Cell
          width={Math.floor(Math.random() * 3)}
          height={Math.floor(Math.random() * 3)}
          title={`Cell ${el}`}
        />
      ))
    }
  </div>
);
