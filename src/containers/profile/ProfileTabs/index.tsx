import React, { FC } from 'react';
import styles from './styles.scss';
import classNames from 'classnames';

interface IProps {
  tab: string;
  is_own: boolean;
  setTab: (tab: string) => void;
}

const ProfileTabs: FC<IProps> = ({ tab, is_own, setTab }) => (
  <div className={styles.wrap}>
    <div
      className={classNames(styles.tab, { [styles.active]: tab === 'profile' })}
      onClick={() => setTab('profile')}
    >
      Профиль
    </div>
    <div
      className={classNames(styles.tab, { [styles.active]: tab === 'messages' })}
      onClick={() => setTab('messages')}
    >
      Сообщения
    </div>
    {is_own && (
      <div
        className={classNames(styles.tab, { [styles.active]: tab === 'settings' })}
        onClick={() => setTab('settings')}
      >
        Настройки
      </div>
    )}
  </div>
);

export { ProfileTabs };
