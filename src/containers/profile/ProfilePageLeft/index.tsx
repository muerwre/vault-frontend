import React, { FC } from 'react';
import { IAuthState } from '~/redux/auth/types';
import { formatText } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import { Placeholder } from '~/components/placeholders/Placeholder';

import styles from './styles.module.scss';
import { Avatar } from '~/components/common/Avatar';
import { Markdown } from '~/components/containers/Markdown';

interface IProps {
  profile: IAuthState['profile'];
  username: string;
}

const ProfilePageLeft: FC<IProps> = ({ username, profile }) => {
  return (
    <div className={styles.wrap}>
      <Avatar
        username={username}
        url={profile.user?.photo?.url}
        className={styles.avatar}
        preset={PRESETS['600']}
      />

      <div className={styles.region}>
        <div className={styles.name}>
          {profile.is_loading ? <Placeholder /> : profile?.user?.fullname}
        </div>

        <div className={styles.username}>
          {profile.is_loading ? <Placeholder /> : `~${profile?.user?.username}`}
        </div>
      </div>

      {profile && profile.user && profile.user.description && (
        <Markdown
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: formatText(profile.user.description) }}
        />
      )}
    </div>
  );
};

export { ProfilePageLeft };
