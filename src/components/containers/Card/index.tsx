import React, { FC } from 'react';
import classNames = require("classnames");
import * as styles from './styles.scss';

type IProps = React.HTMLAttributes<HTMLDivElement> & {}

const Card: FC<IProps> = ({
  className,
  children,
}) => (
    <div className={classNames(styles.card, className)}>
      {children}
    </div>
);

export { Card };
