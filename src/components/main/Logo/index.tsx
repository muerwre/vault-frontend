import React from 'react';
import styles from './styles.module.scss';
import { Link } from 'react-router-dom';

export const Logo = () => (
  <Link className={styles.logo} to="/">
    VAULT
  </Link>
);
