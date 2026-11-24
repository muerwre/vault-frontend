import { FC } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { Card } from '~/components/common/Card';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { imagePresets } from '~/constants/urls';
import { ProfileExtraInfoItem } from '~/containers/profile/ProfileExtraInfo';
import { IUser } from '~/types/auth';
import { formatUsername } from '~/utils/user';

import styles from './styles.module.scss';

interface Props {
  profile: IUser;
  isLoading: boolean;
  username: string;
}

/**
 * The profile beside its flow cells, as rows of the card around it: who it
 * is, the description, then each entry of additional info.
 */
const ProfilePageLeft: FC<Props> = ({ username, profile, isLoading }) => (
  <>
    <Card.Row className={styles.top} seamless>
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
          {isLoading ? <Placeholder /> : formatUsername(profile.username)}
        </div>
      </div>
    </Card.Row>

    {!isLoading && !!profile.description && (
      <Card.Row>
        <div className={styles.description}>{profile.description}</div>
      </Card.Row>
    )}

    {!isLoading &&
      profile.info?.map((item, index) => (
        <Card.Row key={index} className={styles.info}>
          <ProfileExtraInfoItem item={item} />
        </Card.Row>
      ))}
  </>
);

export { ProfilePageLeft };
