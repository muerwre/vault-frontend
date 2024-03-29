import { FC } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { imagePresets } from '~/constants/urls';
import { IUser } from '~/types/auth';

import styles from './styles.module.scss';

interface Props {
  profile: IUser;
  isLoading: boolean;
  username: string;
}

const ProfilePageLeft: FC<Props> = ({ username, profile, isLoading }) => {
  return (
    <div className={styles.wrap}>
      <Avatar
        username={username}
        url={profile?.photo?.url}
        className={styles.avatar}
        preset={imagePresets['600']}
      />

      <div className={styles.region}>
        <div className={styles.name}>
          {isLoading ? <Placeholder /> : profile?.fullname}
        </div>

        <div className={styles.username}>
          {isLoading ? <Placeholder /> : `~${profile?.username}`}
        </div>
      </div>
    </div>
  );
};

export { ProfilePageLeft };
