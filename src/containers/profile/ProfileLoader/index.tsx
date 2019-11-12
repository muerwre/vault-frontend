import React, { FC } from 'react';
import styles from './styles.scss';
import { LoaderCircle } from '~/components/input/LoaderCircle';

interface IProps {}

const ProfileLoader: FC<IProps> = ({}) => {
  return (
    <div className={styles.loader}>
      <LoaderCircle size={40} />
    </div>
  );
};

export { ProfileLoader };
