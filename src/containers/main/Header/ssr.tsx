import dynamic from 'next/dynamic';

import type { HeaderProps } from '~/containers/main/Header/index';

import styles from './styles.module.scss';

export const HeaderSSR = dynamic<HeaderProps>(() => import('./index').then(it => it.Header), {
  ssr: false,
  loading: () => <div className={styles.wrap} />,
});

export const HeaderSSRPlaceholder = () => <div className={styles.wrap} />;
