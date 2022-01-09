import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Tabs } from '~/components/dialogs/Tabs';

interface IProps {
  is_own: boolean;
}

const ProfileTabs: FC<IProps> = ({ is_own }) => {
  const items = ['Профиль', 'Сообщения', ...(is_own ? ['Настройки'] : [])];

  return (
    <div className={styles.wrap}>
      <Tabs.List items={items} />
    </div>
  );
};

export { ProfileTabs };
