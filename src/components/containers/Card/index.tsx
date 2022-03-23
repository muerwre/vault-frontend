import React, { FC } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

type IProps = React.HTMLAttributes<HTMLDivElement> & {
  seamless?: boolean;
};

const Card: FC<IProps> = ({ className, children, seamless, ...props }) => (
  <div className={classNames(styles.card, className, { seamless })} {...props}>
    {children}
  </div>
);

export { Card };
