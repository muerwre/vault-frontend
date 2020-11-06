import React, { HTMLAttributes } from 'react';
import styles from './styles.module.scss';

type IProps = HTMLAttributes<HTMLDivElement> & {};

export const ButtonGroup = ({ children }: IProps) => <div className={styles.wrap}>{children}</div>;
