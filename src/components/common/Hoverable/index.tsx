import React, { FC, ReactNode } from 'react';

import classNames from 'classnames';

import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface HoverableProps extends DivProps {
  icon?: ReactNode;
}

const Hoverable: FC<HoverableProps> = ({
  children,
  className,
  icon,
  ...rest
}) => (
  <div
    {...rest}
    className={classNames(styles.hoverable, className, {
      [styles.with_icon]: !!icon,
    })}
  >
    {icon && <div className={styles.icon}>{icon}</div>}
    {children}
  </div>
);

export { Hoverable };
