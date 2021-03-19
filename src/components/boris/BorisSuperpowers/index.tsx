import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Toggle } from '~/components/input/Toggle';

interface IProps {
  active?: boolean;
  onChange?: (val: boolean) => void;
}

const BorisSuperpowers: FC<IProps> = ({ active, onChange }) => (
  <div className={styles.wrap}>
    <div className={styles.toggle}>
      <Toggle value={active} handler={onChange} />
    </div>

    <div className={styles.left}>
      <div className={styles.title}>Суперспособности</div>
      {active ? (
        <div className={styles.subtitle}>Включи, чтобы видеть будущее</div>
      ) : (
        <div className={styles.subtitle}>Ты видишь всё, что скрыто</div>
      )}
    </div>
  </div>
);

export { BorisSuperpowers };
