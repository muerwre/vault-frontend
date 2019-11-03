import React, { FC } from 'react';
import { BetterScrollDialog } from '../BetterScrollDialog';
import * as styles from './styles.scss';

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
