import React, { FC } from 'react';
import styles from './styles.module.scss';

interface IProps {}

const LabPad: FC<IProps> = () => <div className={styles.pad} />;

export { LabPad };
