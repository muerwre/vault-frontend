import React, { FC } from 'react';
import { BetterScrollDialog } from '../BetterScrollDialog';
import styles from './styles.module.scss';

interface IProps {}

const TestDialog: FC<IProps> = ({}) => (
  <BetterScrollDialog
    header={<div className={styles.head}>HEAD</div>}
    footer={<div className={styles.footer}>FOOTER</div>}
  >
    <div className={styles.example} />
  </BetterScrollDialog>
);

export { TestDialog };
