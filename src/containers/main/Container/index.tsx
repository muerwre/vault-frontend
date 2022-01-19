import React, { FC } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

interface IProps {
  className?: string;
}

const Container: FC<IProps> = ({ className, children }) => (
  <div className={classNames(styles.container, className)}>{children}</div>
);

export { Container };
