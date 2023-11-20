import { FC } from 'react';

import styles from './styles.module.scss';

interface IProps {}

const NodeDeletedBadge: FC<IProps> = () => {
  return (
    <div className={styles.badge}>
      Эта ячейка заблокирована. Её не никто не увидит.
    </div>
  );
};

export { NodeDeletedBadge };
