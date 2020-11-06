import React, { FC } from 'react';
import styles from './styles.module.scss';
import { createPortal } from 'react-dom';
import { GodRays } from '~/components/main/GodRays';

const ErrorNotFound: FC<{}> = () =>
  createPortal(
    <div className={styles.wrap}>
      <GodRays />
      <h2 className={styles.sign}>Страница утеряна</h2>
      <div>Нам очень жаль</div>
    </div>,
    document.body
  );

export { ErrorNotFound };
