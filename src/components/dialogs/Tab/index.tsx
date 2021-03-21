import React, { FC, MouseEventHandler } from 'react';
import classNames from 'classnames';
import styles from './styles.module.scss';

interface IProps {
  active?: boolean;
  onClick?: MouseEventHandler<any>;
}

const Tab: FC<IProps> = ({ active, onClick, children }) => (
  <div className={classNames(styles.tab, { [styles.active]: active })} onClick={onClick}>
    {children}
  </div>
);

export { Tab };
