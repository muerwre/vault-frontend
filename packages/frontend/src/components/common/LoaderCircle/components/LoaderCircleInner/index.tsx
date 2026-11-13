import { FC, SVGAttributes } from 'react';

import classNames from 'classnames';

import { describeArc } from '~/utils/dom';

import styles from './styles.module.scss';

interface Props extends SVGAttributes<SVGElement> {
  size: number;
  className?: string;
}

const LoaderCircleInner: FC<Props> = ({ size, className, ...props }) => (
  <svg
    className={classNames(styles.icon, className)}
    width={size}
    height={size}
    {...props}
  >
    <path d={describeArc(size / 2, size / 2, size / 2, 0, 90)} />
    <path d={describeArc(size / 2, size / 2, size / 2, 180, 270)} />
  </svg>
);

export { LoaderCircleInner };
