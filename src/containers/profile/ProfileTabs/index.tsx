import React, { FC, useCallback } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { IAuthState } from '~/redux/auth/types';

interface IProps {
  tab: string;
  is_own: boolean;
  setTab?: (tab: IAuthState['profile']['tab']) => void;
}

const ProfileTabs: FC<IProps> = ({ tab, is_own, setTab }) => {
  const changeTab = useCallback(
    (tab: IAuthState['profile']['tab']) => () => {
      if (!setTab) return;
      setTab(tab);
    },
    [setTab]
  );

  return (
    <div className={styles.wrap}>
      <div
        className={classNames(styles.tab, { [styles.active]: tab === 'profile' })}
        onClick={changeTab('profile')}
      >
        Профиль
      </div>
      <div
        className={classNames(styles.tab, { [styles.active]: tab === 'messages' })}
        onClick={changeTab('messages')}
      >
        Сообщения
      </div>
      {is_own && (
        <>
          <div
            className={classNames(styles.tab, { [styles.active]: tab === 'settings' })}
            onClick={changeTab('settings')}
          >
            Настройки
          </div>
        </>
      )}
    </div>
  );
};

export { ProfileTabs };
