import { VFC } from 'react';

import { Filler } from '~/components/common/Filler';
import { Group } from '~/components/common/Group';
import { ProfileAvatar } from '~/components/profile/ProfileAvatar';
import { useUser } from '~/hooks/auth/useUser';

import styles from './styles.module.scss';

interface ProfileSidebarHeadProps {}

const ProfileSidebarHead: VFC<ProfileSidebarHeadProps> = () => {
  const { user } = useUser();

  return (
    <Group horizontal>
      <ProfileAvatar canEdit={false} photo={user.photo} size={72} />

      <Filler>
        <div className={styles.name}>{user.fullname || user.username}</div>
        <div className={styles.username}>
          {!!user.fullname && `~${user.username}`}
        </div>
      </Filler>
    </Group>
  );
};

export { ProfileSidebarHead };
