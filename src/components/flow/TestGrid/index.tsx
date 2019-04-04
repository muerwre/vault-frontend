import * as React from 'react';
import classnames from 'classnames';
// import * as AutoResponsive from 'autoresponsive-react';
// const ReactGridLayout = require('react-grid-layout');
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';

const style = require('./style.scss');
// const Packery = require('react-packery-component')(React);
// http://37.192.131.144/hero/photos/photo-20120825-1532512.jpg

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

// export const TestGrid = () => (
//   <ReactGridLayout
//     className="layout"
//     cols={4}
//     rowHeight={256}
//     width={1024 + 256}
//     layout={layout}
//     margin={[0, 0]}
//     compactType="vertical"
//     verticalCompact
//   >
//     <div className={style.cell} key="a" />
//     <div className={style.cell} key="b" />
//     <div className={style.cell} key="c" />
//     <div className={style.cell} key="d" />
//     <div className={style.cell} key="e" />
//     <div className={style.cell} key="f" />
//     <div className={style.cell} key="g" />
//   </ReactGridLayout>
// );

// export const TestGrid = () => (
//   <AutoResponsive
//     itemMargin={0}
//     containerWidth={1024 + 256}
//     itemClassName={style.cell}
//     gridWidth={256}
//     transitionDuration={0}
//   >
//     <div style={{ width: 256 * 4, height: 256 * 2 }} className={style.cell} key="a" />
//     <div style={{ width: 256, height: 256 * 2 }} className={style.cell} key="b" />
//     <div style={{ width: 256, height: 256 }} className={style.cell} key="c" />
//     <div style={{ width: 256, height: 256 }} className={style.cell} key="d" />
//     <div style={{ width: 256, height: 256 }} className={style.cell} key="d" />
//     <div style={{ width: 256 * 2, height: 256 * 2 }} className={style.cell} key="h" />
//     <div style={{ width: 256 * 2, height: 256 }} className={style.cell} key="e" />
//     <div style={{ width: 256 * 2, height: 256 }} className={style.cell} key="f" />
//     <div style={{ width: 256 * 2, height: 256 }} className={style.cell} key="g" />
//     <div style={{ width: 256 * 2, height: 256 }} className={style.cell} key="g1" />
//     <div style={{ width: 256, height: 256 }} className={style.cell} key="d" />
//     <div style={{ width: 256, height: 256 }} className={style.cell} key="d1" />
//     <div style={{ width: 256, height: 256 }} className={style.cell} key="d2" />
//     <div style={{ width: 256, height: 256 }} className={style.cell} key="d3" />
//     <div style={{ width: 256, height: 256 }} className={style.cell} key="d4" />
//   </AutoResponsive>
// );
