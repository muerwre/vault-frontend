import React from 'react';
import styles from './style.scss';
import { Link } from 'react-router-dom';

export const Logo = () => (
  <Link className={styles.logo} to="/">
    УБЕЖИЩЕ
  </Link>
);
