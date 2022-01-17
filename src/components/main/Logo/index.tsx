import React from 'react';
import styles from './styles.module.scss';
import { Anchor } from '~/components/common/Anchor';
import { URLS } from '~/constants/urls';

export const Logo = () => (
  <Anchor className={styles.logo} href={URLS.BASE}>
    VAULT
  </Anchor>
);
