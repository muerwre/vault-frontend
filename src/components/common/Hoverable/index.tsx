import React, { FC, ReactNode } from 'react';

import classNames from 'classnames';

import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

type HoverableEffect = 'rise' | 'shine';

interface HoverableProps extends DivProps {
  icon?: ReactNode;
  effect?: HoverableEffect;
}

const Hoverable: FC<HoverableProps> = ({
  children,
  className,
  icon,
  effect = 'rise',
  ...rest
}) => (
  <div
    {...rest}
    className={classNames(styles.hoverable, styles[effect], className, {
      [styles.with_icon]: !!icon,
    })}
  >
    {icon && <div className={styles.icon}>{icon}</div>}
    {children}
  </div>
);

export { Hoverable };
