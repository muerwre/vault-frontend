import { FC } from 'react';

import classNames from 'classnames';

import { Filler } from '~/components/common/Filler';
import { Group } from '~/components/common/Group';
import { ProfileLink } from '~/components/profile/ProfileLink';
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
          <h5 className={styles.fullname}>
            <ProfileLink username={user.username}>
              {user.fullname || user.username}
            </ProfileLink>
          </h5>
          <div className={styles.username}>
            <ProfileLink username={user.username}>~{user.username}</ProfileLink>
          </div>

          <div
            className={classNames(styles.status, { [styles.active]: isActive })}
          >
            {isActive ? 'юнит в сознании' : 'юнит деактивирован'}
          </div>
        </Filler>
      </Group>
    </Group>
  );
};

export { ProfileQuickInfo };
