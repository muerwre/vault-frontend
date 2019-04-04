import * as React from 'react';
import classnames from 'classnames';

const style = require('./style.scss');

export const TestGrid = () => (
  <div className={style.grid_test}>
    <div className={classnames([style.cell, style.vert_1, style.hor_4])} key="b" />
    <div className={classnames([style.cell, style.vert_2, style.hor_1, style.pad_last])} key="a" />
    <div className={classnames([style.cell, style.vert_1, style.hor_1])} key="c" />
    <div className={classnames([style.cell, style.vert_1, style.hor_1])} key="d" />
    <div className={classnames([style.cell, style.vert_2, style.hor_3])} key="e" />
    <div className={classnames([style.cell, style.vert_2, style.hor_2])} key="f" />
    <div className={classnames([style.cell, style.vert_2, style.hor_1])} key="g" />
    <div className={classnames([style.cell, style.vert_2, style.hor_1])} key="h" />
    <div className={classnames([style.cell, style.vert_4, style.hor_1])} key="i" />
    <div className={classnames([style.cell, style.vert_1, style.hor_1])} key="j" />
  </div>
);
