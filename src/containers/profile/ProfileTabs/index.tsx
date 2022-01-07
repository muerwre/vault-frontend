import React, { FC } from "react";
import styles from "./styles.module.scss";
import { IAuthState } from "~/redux/auth/types";
import { Tabs } from "~/components/dialogs/Tabs";

interface IProps {
  tab: string;
  is_own: boolean;
  setTab?: (tab: IAuthState['profile']['tab']) => void;
}

const ProfileTabs: FC<IProps> = ({ tab, is_own, setTab }) => {
  const items = ['Профиль', 'Сообщения', ...(is_own ? ['Настройки'] : [])];

  return (
    <div className={styles.wrap}>
      <Tabs.List items={items} />
    </div>
  );
};

export { ProfileTabs };
