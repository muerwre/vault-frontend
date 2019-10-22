import React, { FC } from 'react';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import * as styles from './styles.scss';

const LoadingDialog: FC<{}> = () => (
  <div className={styles.wrap}>
    <LoaderCircle size={64} />
  </div>
);

export { LoadingDialog };
