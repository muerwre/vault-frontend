import React, { FC } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';

interface IProps {
  className?: string;
}

const Container: FC<IProps> = ({ className, children }) => (
  <div className={classNames(styles.container, className)}>{children}</div>
);

export { Container };
