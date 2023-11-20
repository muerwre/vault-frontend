import { FC } from 'react';

import { LoaderCircle } from '~/components/common/LoaderCircle';

import styles from './styles.module.scss';

const NodeImageBlockPlaceholder: FC<{}> = () => (
  <div className={styles.placeholder}>
    <LoaderCircle size={64} />
  </div>
);

export { NodeImageBlockPlaceholder };
