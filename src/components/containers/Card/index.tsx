import React, { FC } from 'react';
import * as styles from './styles.scss';

import classNames = require('classnames');

type IProps = React.HTMLAttributes<HTMLDivElement> & {
  seamless?: boolean;
}

const Card: FC<IProps> = ({
  className,
  children,
  seamless,
  ...props
}) => (
  <div
    className={classNames(styles.card, className, { seamless })}
    {...props}
  >
    {children}
  </div>
);

export { Card };
