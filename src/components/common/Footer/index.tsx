import { FC, memo } from 'react';

import styles from './styles.module.scss';

interface Props {}

const Footer: FC<Props> = memo(() => (
  <footer className={styles.footer}>
    <div className={styles.slogan}>Уделяй больше времени тишине. Спасибо</div>
    <div className={styles.copy}>2009 - {new Date().getFullYear()}</div>
  </footer>
));

export { Footer };
