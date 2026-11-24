import { FC } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { imagePresets } from '~/constants/urls';
import { ProfileExtraInfoItem } from '~/containers/profile/ProfileExtraInfo';
import { IUser } from '~/types/auth';
import { formatUsername } from '~/utils/user';

import styles from './styles.module.scss';

interface Props {
  profile: IUser;
  username: string;
  isLoading: boolean;
}

/**
 * The profile as an aura: no posts, just who it is, centred over the cover:
 * the avatar, the name, the description and the additional info.
 */
const ProfileAura: FC<Props> = ({ profile, username, isLoading }) => (
  <div className={styles.wrap}>
    <Avatar
      username={username}
      url={profile.photo?.url}
      className={styles.avatar}
      preset={imagePresets['600']}
    />

    <div className={styles.names}>
      <div className={styles.name}>
        {isLoading ? <Placeholder /> : profile.fullname || profile.username}
      </div>

      <div className={styles.username}>
        {isLoading ? <Placeholder /> : formatUsername(profile.username)}
      </div>
    </div>

    {!isLoading && !!profile.description && (
      <div className={styles.description}>{profile.description}</div>
    )}

    {!isLoading && !!profile.info?.length && (
      <div className={styles.info}>
        {profile.info.map((item, index) => (
          <div key={index} className={styles.info_item}>
            <ProfileExtraInfoItem item={item} />
          </div>
        ))}
      </div>
    )}
  </div>
);

export { ProfileAura };
