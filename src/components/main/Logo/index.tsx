import React from 'react';

import { Anchor } from '~/components/common/Anchor';
import { URLS } from '~/constants/urls';

import styles from './styles.module.scss';

export const Logo = () => (
  <Anchor className={styles.logo} href={URLS.BASE}>
    VAULT
  </Anchor>
);
