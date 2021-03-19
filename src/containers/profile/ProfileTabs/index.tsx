import React, { FC, useCallback } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { IAuthState } from '~/redux/auth/types';
import { Tabs } from '~/components/dialogs/Tabs';
import { Tab } from '~/components/dialogs/Tab';

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
    <Tabs>
      <Tab active={tab === 'profile'} onClick={changeTab('profile')}>
        Профиль
      </Tab>

      <Tab active={tab === 'messages'} onClick={changeTab('messages')}>
        Сообщения
      </Tab>
      {is_own && (
        <Tab active={tab === 'settings'} onClick={changeTab('settings')}>
          Настройки
        </Tab>
      )}
    </Tabs>
  );
};

export { ProfileTabs };
