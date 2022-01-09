import React, { FC } from 'react';
import { IUser } from '~/types/auth';
import { formatText } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import { Placeholder } from '~/components/placeholders/Placeholder';

import styles from './styles.module.scss';
import { Avatar } from '~/components/common/Avatar';
import { Markdown } from '~/components/containers/Markdown';

interface IProps {
  profile: IUser;
  isLoading: boolean;
  username: string;
}

const ProfilePageLeft: FC<IProps> = ({ username, profile, isLoading }) => {
  return (
    <div className={styles.wrap}>
      <Avatar
        username={username}
        url={profile?.photo?.url}
        className={styles.avatar}
        preset={PRESETS['600']}
      />

      <div className={styles.region}>
        <div className={styles.name}>{isLoading ? <Placeholder /> : profile?.fullname}</div>`
        <div className={styles.username}>
          {isLoading ? <Placeholder /> : `~${profile?.username}`}
        </div>
      </div>

      {!!profile?.description && (
        <Markdown
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: formatText(profile.description) }}
        />
      )}
    </div>
  );
};

export { ProfilePageLeft };
