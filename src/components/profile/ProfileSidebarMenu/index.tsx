import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';

interface IProps {}

const ProfileSidebarMenu: FC<IProps> = () => (
  <div className={styles.wrap}>
    <div className={styles.row}>
      <Icon icon="settings" />
      <span>Настройки</span>
    </div>

    <div className={styles.row}>
      <Icon icon="messages" />
      <span>Сообщения</span>
    </div>
  </div>
);

export { ProfileSidebarMenu };
