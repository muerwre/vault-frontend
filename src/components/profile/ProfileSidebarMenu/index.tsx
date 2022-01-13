import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { Anchor } from '~/components/common/Anchor';

interface IProps {
  path: string;
}

const ProfileSidebarMenu: FC<IProps> = ({ path }) => {
  const cleaned = path.replace(/\/$/, '');

  return (
    <div className={styles.wrap}>
      <Anchor className={styles.row} href={`${cleaned}/settings`}>
        <Icon icon="settings" />
        <span>Настройки</span>
      </Anchor>

      <div className={styles.row}>
        <Icon icon="messages" />
        <span>Сообщения</span>
      </div>
    </div>
  );
};

export { ProfileSidebarMenu };
