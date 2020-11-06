import React, { FC, ReactNode } from 'react';
import styles from './styles.module.scss';

interface IProps {
  children: ReactNode;
}

const DialogTitle: FC<IProps> = ({ children }) => <h2 className={styles.title}>{children}</h2>;

export { DialogTitle };
