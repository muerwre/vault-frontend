import React, { VFC } from 'react';

import { LoaderCircle } from '~/components/input/LoaderCircle';

import styles from './styles.module.scss';

const LoadingDialog: VFC = () => (
  <div className={styles.wrap}>
    <LoaderCircle size={64} />
  </div>
);

export { LoadingDialog };
