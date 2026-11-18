import { FC } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { Card } from '~/components/common/Card';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { imagePresets } from '~/constants/urls';
import { ProfileLinks } from '~/containers/profile/ProfileLinks';
import { IUser } from '~/types/auth';

import styles from './styles.module.scss';

interface Props {
  profile: IUser;
  isLoading: boolean;
  username: string;
}

const ProfilePageLeft: FC<Props> = ({ username, profile, isLoading }) => (
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
          {isLoading ? <Placeholder /> : profile.fullname || profile.username}
        </div>

        <div className={styles.username}>
          {isLoading ? <Placeholder /> : `~${profile.username}`}
        </div>
      </div>
    </Card>

    {!isLoading && !!profile.description && (
      <div className={styles.region}>
        <div className={styles.description}>{profile.description}</div>
      </div>
    )}

    {!isLoading && !!profile.links?.length && (
      <div className={styles.region}>
        <ProfileLinks links={profile.links} />
      </div>
    )}
  </Card>
);

export { ProfilePageLeft };
