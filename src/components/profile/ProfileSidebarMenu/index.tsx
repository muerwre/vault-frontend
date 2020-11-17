import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { Link } from 'react-router-dom';

interface IProps {
  path: string;
}

const ProfileSidebarMenu: FC<IProps> = ({ path }) => {
  const cleaned = path.replace(/\/$/, '');

  return (
    <div className={styles.wrap}>
      <Link className={styles.row} to={`${cleaned}/settings`}>
        <Icon icon="settings" />
        <span>Настройки</span>
      </Link>

      <div className={styles.row}>
        <Icon icon="messages" />
        <span>Сообщения</span>
      </div>
    </div>
  );
};

export { ProfileSidebarMenu };
