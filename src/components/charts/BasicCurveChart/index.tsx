import React, { useMemo, VFC } from 'react';

import { lighten } from 'color2k';

import { makeBezierCurve, PathPoint } from '~/utils/dom/makeBezierCurve';
import { SVGProps } from '~/utils/types';

interface BasicCurveChartProps extends SVGProps {
  items: number[];
  gap?: number;
  fullscreen?: boolean;
}

const gap = 5;
const BasicCurveChart: VFC<BasicCurveChartProps> = ({
  stroke = '#007962',
  items = [],
  fullscreen = true,
  ...props
}) => {
  const max = Math.max(...items);
  const height = props.height ? parseFloat(props.height.toString()) : 100;
  const width = props.width ? parseFloat(props.width.toString()) : 100;
  const borderGap = fullscreen ? 0 : gap;

  const points = useMemo(
    () =>
      items.reduce<PathPoint[]>(
        (acc, val, index) => [
          ...acc,
          index === 0
            ? { x: borderGap, y: height - (val / max) * (height - gap * 2) - gap }
            : {
                x: ((width - borderGap) / (items.length - 1)) * index,
                y: height - (val / max) * (height - gap * 2) - gap,
              },
        ],
        []
      ),
    [height, width, items, gap]
  );

  if (!points.length) {
    return null;
  }

  return (
    <svg
      {...props}
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="f1" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
      </defs>

      <path
        d={makeBezierCurve(points)}
        fill="none"
        x={0}
        y={0}
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        filter="url(#f1)"
      />

      <path
        d={makeBezierCurve(points)}
        fill="none"
        x={0}
        y={0}
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
      />

      <path
        d={makeBezierCurve(points)}
        fill="none"
        x={0}
        y={0}
        stroke={lighten(stroke, 0.1)}
        strokeWidth={1}
        strokeLinecap="round"
      />
    </svg>
  );
};

export { BasicCurveChart };
