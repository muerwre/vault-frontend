import * as React from 'react';
import { Cell } from "~/components/flow/Cell";
import { range } from 'ramda';

const style = require('./style.scss');

export const TestGrid = () => (
  <div className={style.grid_test}>
    <Cell
      height={1}
      width={4}
      title="Example cell Example cell Example cell Example cell Example cell Example cell Example cell "
      is_hero
    />
    {
      range(1,20).map(el => (
        <Cell
          width={1}
          height={1}
          title="Example cell Example cell Example cell Example cell Example cell Example cell Example cell "
        />
      ))
    }
  </div>
);
