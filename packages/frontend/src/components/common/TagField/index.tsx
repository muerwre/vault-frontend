import { FC, HTMLAttributes } from 'react';

import styles from './styles.module.scss';

type Props = HTMLAttributes<HTMLDivElement> & {};

const TagField: FC<Props> = ({ children }) => (
  <div className={styles.wrap}>{children}</div>
);

export { TagField };
