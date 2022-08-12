import React, { FC } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { Markdown } from '~/components/containers/Markdown';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { ImagePresets } from '~/constants/urls';
import { IUser } from '~/types/auth';
import { formatText } from '~/utils/dom';

import styles from './styles.module.scss';

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
        preset={ImagePresets['600']}
      />

      <div className={styles.region}>
        <div className={styles.name}>
          {isLoading ? <Placeholder /> : profile?.fullname}
        </div>
        `
        <div className={styles.username}>
          {isLoading ? <Placeholder /> : `~${profile?.username}`}
        </div>
      </div>

      {!!profile?.description && (
        <Markdown className={styles.description}>
          {formatText(profile.description)}
        </Markdown>
      )}
    </div>
  );
};

export { ProfilePageLeft };
