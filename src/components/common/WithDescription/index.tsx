import { FC, ReactNode, useCallback } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

interface Props {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  link?: string;
}

const WithDescription: FC<Props> = ({ icon, title, subtitle, link }) => {
  const onClick = useCallback(() => {
    if (!link) return;

    window.open(link);
  }, []);

  return (
    <div
      onClick={onClick}
      className={classNames(styles.item, { [styles.link]: link })}
      role={link ? 'button' : 'none'}
    >
      <div className={styles.icon}>{icon}</div>

      <div className={styles.info}>
        <div className={styles.title}>{title}</div>
        {!!subtitle?.trim() && (
          <div className={styles.subtitle}>{subtitle}</div>
        )}
      </div>
    </div>
  );
};

export { WithDescription };
