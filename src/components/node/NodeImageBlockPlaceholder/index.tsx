import React, { FC } from 'react';

import { LoaderCircle } from '~/components/input/LoaderCircle';

import styles from './styles.module.scss';

const NodeImageBlockPlaceholder: FC<{}> = () => (
  <div className={styles.placeholder}>
    <LoaderCircle size={64} />
  </div>
);

export { NodeImageBlockPlaceholder };
