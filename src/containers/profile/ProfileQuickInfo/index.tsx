import React, { FC, useMemo } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { Filler } from '~/components/containers/Filler';
import { Group } from '~/components/containers/Group';
import { useRandomPhrase } from '~/constants/phrases';
import { useColorGradientFromString } from '~/hooks/color/useColorGradientFromString';
import { IUser } from '~/types/auth';
import { generateGradientFromColor } from '~/utils/color';
import { path } from '~/utils/ramda';

import styles from './styles.module.scss';

interface ProfileQuickInfoProps {
  user: IUser;
}

const ProfileQuickInfo: FC<ProfileQuickInfoProps> = ({ user }) => {
  const style = useMemo(() => {
    const color = user.photo?.metadata?.dominant_color;
    const gradient = color && generateGradientFromColor(color);

    return gradient ? { background: gradient } : undefined;
  }, [user]);

  return (
    <Group className={styles.wrapper} style={style}>
      <Group className={styles.top} horizontal>
        <div>
          <Avatar url={path(['photo', 'url'], user)} username={user.username} />
        </div>

        <Filler>
          <h5 className={styles.fullname}>{user.fullname || user.username}</h5>
          <div className={styles.username}>~{user.username}</div>
        </Filler>
      </Group>
    </Group>
  );
};

export { ProfileQuickInfo };
