import React, { VFC } from 'react';

import { SVGProps } from '~/utils/types';

interface BasicCurveChartProps extends SVGProps {
  items: number[];
}

const BasicCurveChart: VFC<BasicCurveChartProps> = ({
  stroke = '#007962',
  items = [],
  ...props
}) => {
  const max = Math.max(...items) + 5;
  const height = props.height ? parseFloat(props.height.toString()) : 100;
  const width = props.width ? parseFloat(props.width.toString()) : 100;

  const d = items.reduce<string[]>(
    (acc, val, index) => [
      ...acc,
      index === 0
        ? `M 5 ${height - (val / max) * height}`
        : `L ${(width / (items.length - 1)) * index} ${height - (val / max) * height}`,
    ],
    []
  );

  return (
    <svg {...props} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <filter id="f1" x="0" y="0">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
      </defs>

      <path d={d.join(' ')} fill="none" x={0} y={0} stroke={stroke} filter="url(#f1)" />
      <path d={d.join(' ')} fill="none" x={0} y={0} stroke={stroke} />
    </svg>
  );
};

export { BasicCurveChart };
