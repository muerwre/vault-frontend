import { FC } from 'react';

import { Tabs } from '~/components/common/Tabs';

import styles from './styles.module.scss';

interface Props {
  is_own: boolean;
}

const ProfileTabs: FC<Props> = ({ is_own }) => {
  const items = ['Профиль', 'Сообщения', ...(is_own ? ['Настройки'] : [])];

  return (
    <div className={styles.wrap}>
      <Tabs.Horizontal items={items} />
    </div>
  );
};

export { ProfileTabs };
