import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  link: string;
}

const BorisContactItem: FC<Props> = ({ icon, title, subtitle, link }) => (
  <a className={styles.item} href={link} target="_blank" rel="noreferrer">
    <div className={styles.icon}>
      <Icon icon={icon} size={32} />
    </div>

    <div className={styles.info}>
      <div className={styles.title}>{title}</div>
      <div className={styles.subtitle}>{subtitle}</div>
    </div>
  </a>
);

export { BorisContactItem };
