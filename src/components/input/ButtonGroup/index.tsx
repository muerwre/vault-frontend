import React, { HTMLAttributes } from 'react';
import * as styles from './styles.scss';

type IProps = HTMLAttributes<HTMLDivElement> & {};

export const ButtonGroup = ({ children }: IProps) => <div className={styles.wrap}>{children}</div>;
