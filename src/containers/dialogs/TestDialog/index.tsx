import { FC } from 'react';

import { BetterScrollDialog } from '~/components/common/BetterScrollDialog';

import styles from './styles.module.scss';

interface Props {}

const TestDialog: FC<Props> = () => (
  <BetterScrollDialog
    header={<div className={styles.head}>HEAD</div>}
    footer={<div className={styles.footer}>FOOTER</div>}
  >
    <div className={styles.example} />
  </BetterScrollDialog>
);

export { TestDialog };
