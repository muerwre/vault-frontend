import React, { FC, ReactNode, useCallback } from 'react';

import { Group } from '~/components/containers/Group';
import { Icon } from '~/components/input/Icon';

import styles from './styles.module.scss';

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  link: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

const BorisContactItem: FC<Props> = ({
  icon,
  title,
  subtitle,
  link,
  prefix,
  suffix,
}) => {
  const onClick = useCallback(() => {
    if (!link) return;

    window.open(link);
  }, []);

  return (
    <div>
      {prefix}
      <div
        onClick={onClick}
        className={styles.item}
        role={link ? 'button' : 'none'}
      >
        <div className={styles.icon}>
          <Icon icon={icon} size={32} />
        </div>

        <div className={styles.info}>
          <div className={styles.title}>{title}</div>
          <div className={styles.subtitle}>{subtitle}</div>
        </div>
      </div>
      {suffix}
    </div>
  );
};

export { BorisContactItem };
