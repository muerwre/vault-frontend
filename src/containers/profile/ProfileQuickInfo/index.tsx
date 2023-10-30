import React, { FC } from 'react';

import classNames from 'classnames';

import { Filler } from '~/components/containers/Filler';
import { Group } from '~/components/containers/Group';
import { useUserActiveStatus } from '~/hooks/auth/useUserActiveStatus';
import { IUser } from '~/types/auth';

import styles from './styles.module.scss';

interface ProfileQuickInfoProps {
  user: IUser;
}

const ProfileQuickInfo: FC<ProfileQuickInfoProps> = ({ user }) => {
  const isActive = useUserActiveStatus(user.last_seen);

  return (
    <Group className={styles.wrapper}>
      <Group className={styles.top} horizontal>
        <Filler className={styles.names}>
          <h5 className={styles.fullname}>{user.fullname || user.username}</h5>
          <div className={styles.username}>~{user.username}</div>

          <div className={classNames(styles.status, { [styles.active]: isActive })}>
            {isActive ? 'юнит в сознании' : 'юнит деактивирован'}
          </div>
        </Filler>
      </Group>
    </Group>
  );
};

export { ProfileQuickInfo };
