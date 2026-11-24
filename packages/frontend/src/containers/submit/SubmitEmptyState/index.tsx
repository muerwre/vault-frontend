import { FC, ReactNode } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

interface Props {
  icon?: ReactNode;
  title?: string;
  hint?: string;
  /** Whatever adds the first item: buttons, or a form. */
  children: ReactNode;
  /** Stacks the actions instead of laying them in a row. */
  vertical?: boolean;
}

/**
 * What a content zone shows before its first item: fills the zone and
 * centres an icon, a line or two and the way to add something.
 */
const SubmitEmptyState: FC<Props> = ({
  icon,
  title,
  hint,
  children,
  vertical,
}) => (
  <div className={styles.wrap}>
    {!!icon && <div className={styles.icon}>{icon}</div>}
    {!!title && <div className={styles.title}>{title}</div>}
    {!!hint && <div className={styles.hint}>{hint}</div>}

    <div
      className={classNames(styles.actions, { [styles.vertical]: vertical })}
    >
      {children}
    </div>
  </div>
);

export { SubmitEmptyState };
