import React from 'react';

import { HistorySlide } from '~/components/welcome/HistorySlide';
import { PersonsSlide } from '~/components/welcome/PersonsSlide';
import { WelcomeSlide } from '~/components/welcome/WelcomeSlide';

import styles from './styles.module.scss';

const WelcomeLayout = () => (
  <div className={styles.layout}>
    <WelcomeSlide />
    <HistorySlide />
    <PersonsSlide />
  </div>
);

export { WelcomeLayout };
