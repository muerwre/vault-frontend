import { Fragment, VFC } from 'react';

import { useSSRLoadingIndicator } from '~/hooks/dom/useSSRLoadingIndicator';

import styles from './styles.module.scss';

interface LoadingProgressProps {}

const LoadingProgress: VFC<LoadingProgressProps> = () => {
  const shown = useSSRLoadingIndicator(700);

  return shown ? (
    <>
      <div className={styles.loader} />
      <div className={styles.label}>Секундочку...</div>
    </>
  ) : (
    <Fragment />
  );
};

export { LoadingProgress };
