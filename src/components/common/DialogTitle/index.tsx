import { FC, ReactNode } from 'react';

import styles from './styles.module.scss';

interface Props {
  children: ReactNode;
}

const DialogTitle: FC<Props> = ({ children }) => (
  <h2 className={styles.title}>{children}</h2>
);

export { DialogTitle };
