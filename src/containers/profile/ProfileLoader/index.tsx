import React, { FC } from 'react';

import { LoaderCircle } from '~/components/input/LoaderCircle';

import styles from './styles.module.scss';

interface IProps {}

const ProfileLoader: FC<IProps> = () => {
  return (
    <div className={styles.loader}>
      <LoaderCircle size={40} />
    </div>
  );
};

export { ProfileLoader };
