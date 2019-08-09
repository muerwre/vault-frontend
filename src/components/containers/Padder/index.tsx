import React, { FC } from 'react';
import * as styles from './styles.scss';

import classNames = require('classnames');

type IProps = React.HTMLAttributes<HTMLDivElement> & {
  padding?: number;
  vertical?: boolean;
  horizontal?: boolean;
}

const Padder: FC<IProps> = ({
  padding,
  children,
  className,
  style = {},
  vertical,
  horizontal,
  ...props
}) => (
  <div
    className={classNames(styles.padder, className, { vertical, horizontal })}
    style={padding ? { ...style, padding } : style}
    {...props}
  >
    {children}
  </div>
);

export { Padder };
