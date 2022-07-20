import React, { FC, useMemo } from 'react';

import classNames from 'classnames';

import { Avatar } from '~/components/common/Avatar';
import { Filler } from '~/components/containers/Filler';
import { Group } from '~/components/containers/Group';
import { useRandomPhrase } from '~/constants/phrases';
import { useUserActiveStatus } from '~/hooks/auth/useUserActiveStatus';
import { useUserDescription } from '~/hooks/auth/useUserDescription';
import { useColorGradientFromString } from '~/hooks/color/useColorGradientFromString';
import { IUser } from '~/types/auth';
import { generateGradientFromColor } from '~/utils/color';
import { path } from '~/utils/ramda';

import styles from './styles.module.scss';

interface ProfileQuickInfoProps {
  user: IUser;
}

const ProfileQuickInfo: FC<ProfileQuickInfoProps> = ({ user }) => {
  const isActive = useUserActiveStatus(user.last_seen);

  return (
    <Group className={styles.wrapper}>
      <Group className={styles.top} horizontal>
        <div>
          <Avatar url={path(['photo', 'url'], user)} username={user.username} />
        </div>

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
