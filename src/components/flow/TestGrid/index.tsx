import * as React from 'react';
import { Cell } from "~/components/flow/Cell";

const style = require('./style.scss');

export const TestGrid = () => (
  <div className={style.grid_test}>
    <Cell
      height={1}
      width={4}
      title="Example cell Example cell Example cell Example cell Example cell Example cell Example cell "
      is_hero
    />

    <Cell />
    <Cell
      height={2}
      title="Example cell Example cell Example cell Example cell Example cell Example cell Example cell "
    />
    <Cell width={2} />
    <Cell />
  </div>
);
