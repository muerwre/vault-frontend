import { FC } from 'react';

import { LoaderCircle } from '~/components/common/LoaderCircle';

import styles from './styles.module.scss';

interface Props {}

const ProfileLoader: FC<Props> = () => {
  return (
    <div className={styles.loader}>
      <LoaderCircle size={40} />
    </div>
  );
};

export { ProfileLoader };
