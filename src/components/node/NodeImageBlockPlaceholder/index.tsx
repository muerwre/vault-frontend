import React, { FC } from 'react';
import * as styles from './styles.scss';
import { LoaderCircle } from '~/components/input/LoaderCircle';

const NodeImageBlockPlaceholder: FC<{}> = () => (
  <div className={styles.placeholder}>
    <LoaderCircle size={64} />
  </div>
);

export { NodeImageBlockPlaceholder };
