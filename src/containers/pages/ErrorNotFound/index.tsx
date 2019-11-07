import React, { FC } from 'react';
import styles from './styles.scss';

interface IProps {}

const ErrorNotFound: FC<IProps> = ({}) => (
  <div className={styles.wrap}>
    <div className={styles.content}>
      <div className={styles.sign}>НЕ НАЙДЕН</div>
      <div>Нам очень жаль.</div>
    </div>
    <div className={styles.image} />
  </div>
);

export { ErrorNotFound };
