import { FC } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { Card } from '~/components/common/Card';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { imagePresets } from '~/constants/urls';
import { ProfileExtraInfo } from '~/containers/profile/ProfileExtraInfo';
import { IUser } from '~/types/auth';
import { formatUsername } from '~/utils/user';

import styles from './styles.module.scss';

interface Props {
  profile: IUser;
  isLoading: boolean;
  username: string;
}

/** The profile as the first of its lab cards: avatar, then who and info. */
const ProfileLabCard: FC<Props> = ({ username, profile, isLoading }) => (
  <div className={styles.wrap}>
    <Card.Row className={styles.head}>
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
      </div>
    </Card.Row>

    <Card.Row className={styles.footer}>
      {!isLoading && !!profile.info?.length && (
        <div className={styles.extra}>
          <ProfileExtraInfo info={profile.info} />
        </div>
      )}
    </Card.Row>
  </div>
);

export { ProfileLabCard };
