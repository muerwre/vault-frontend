import React, { FC } from 'react';

import { Group } from '~/components/common/Group';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { ProfileAvatar } from '~/components/profile/ProfileAvatar';
import { usePatchUser } from '~/hooks/auth/usePatchUser';
import { useUser } from '~/hooks/auth/useUser';
import { getPrettyDate } from '~/utils/dom';
import { useProfileContext } from '~/utils/providers/ProfileProvider';

import { ProfileTabs } from '../ProfileTabs';

import styles from './styles.module.scss';

interface IProps {
  isLoading?: boolean;
  isOwn: boolean;
}

const ProfileInfo: FC<IProps> = ({ isOwn }) => {
  const { user } = useUser();
  const { updatePhoto } = usePatchUser();
  const { profile, isLoading } = useProfileContext();

  const photo = isOwn ? user.photo : profile.photo;
  const fullName = isOwn ? user.fullname : profile.fullname;
  const lastSeen = isOwn ? new Date().toISOString() : profile.last_seen;
  const username = isOwn ? user.username : profile.username;

  return (
    <div>
      <Group className={styles.wrap} horizontal>
        <div className={styles.avatar}>
          <ProfileAvatar
            canEdit={isOwn}
            onChangePhoto={updatePhoto}
            photo={photo}
          />
        </div>

        <div className={styles.field}>
          <div className={styles.name}>
            {isLoading ? <Placeholder width="80%" /> : fullName || username}
          </div>

          <div className={styles.description}>
            {isLoading ? <Placeholder /> : getPrettyDate(lastSeen)}
          </div>
        </div>
      </Group>

      <ProfileTabs is_own={isOwn} />
    </div>
  );
};

export { ProfileInfo };
