import React, { FC } from 'react';
import styles from './styles.module.scss';
import { LoaderCircle } from '~/components/input/LoaderCircle';

const NodeImageBlockPlaceholder: FC<{}> = () => (
  <div className={styles.placeholder}>
    <LoaderCircle size={64} />
  </div>
);

export { NodeImageBlockPlaceholder };
