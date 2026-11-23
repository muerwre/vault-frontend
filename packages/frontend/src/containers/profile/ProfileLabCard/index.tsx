import { FC } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { Card } from '~/components/common/Card';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { imagePresets } from '~/constants/urls';
import { ProfileLinks } from '~/containers/profile/ProfileLinks';
import { IUser } from '~/types/auth';
import { formatUsername } from '~/utils/user';

import styles from './styles.module.scss';

interface Props {
  profile: IUser;
  isLoading: boolean;
  username: string;
}

/** The profile as the first of its lab cards: avatar, then who and links. */
const ProfileLabCard: FC<Props> = ({ username, profile, isLoading }) => (
  <Card className={styles.wrap} elevation={0}>
    <Avatar
      username={username}
      url={profile?.photo?.url}
      className={styles.avatar}
      preset={imagePresets['300']}
    />

    <div className={styles.info}>
      <div className={styles.name}>
        {isLoading ? <Placeholder /> : profile.fullname || profile.username}
      </div>

      <div className={styles.username}>
        {isLoading ? <Placeholder /> : formatUsername(profile.username)}
      </div>

      {!isLoading && !!profile.links?.length && (
        <div className={styles.links}>
          <ProfileLinks links={profile.links} />
        </div>
      )}
    </div>
  </Card>
);

export { ProfileLabCard };
