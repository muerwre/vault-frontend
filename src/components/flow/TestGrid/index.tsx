import * as React from 'react';
import classnames from 'classnames';
import { Cell } from "~/components/flow/Cell";

const style = require('./style.scss');

export const TestGrid = () => (
  <div className={style.grid_test}>
    <Cell
      height={1}
      width={4}
      title="Example cell"
    />

    <Cell />
    <Cell height={2} />
    <Cell width={2} />
    <Cell />
  </div>
);
