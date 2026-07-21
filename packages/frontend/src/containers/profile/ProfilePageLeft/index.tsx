import { FC } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { Card } from '~/components/common/Card';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { imagePresets } from '~/constants/urls';
import { IUser } from '~/types/auth';

import styles from './styles.module.scss';

interface Props {
  profile: IUser;
  isLoading: boolean;
  username: string;
  description: string;
}

const ProfilePageLeft: FC<Props> = ({
  username,
  profile,
  description,
  isLoading,
}) => {
  return (
    <Card className={styles.wrap} elevation={0} seamless>
      <Card seamless>
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
      </Card>
      <div className={styles.region}>
        <div className={styles.description}>{description}</div>
      </div>
    </Card>
  );
};

export { ProfilePageLeft };
