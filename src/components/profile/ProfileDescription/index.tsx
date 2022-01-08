import React, { FC } from 'react';
import { formatText } from '~/utils/dom';
import styles from './styles.module.scss';
import { ProfileLoader } from '~/containers/profile/ProfileLoader';
import { Group } from '~/components/containers/Group';
import markdown from '~/styles/common/markdown.module.scss';
import classNames from 'classnames';
import { useProfileContext } from '~/utils/providers/ProfileProvider';

const ProfileDescription: FC = () => {
  const { profile, isLoading } = useProfileContext();

  if (isLoading) return <ProfileLoader />;

  return (
    <div className={styles.wrap}>
      {!!profile?.description && (
        <Group
          className={classNames(styles.content, markdown.wrapper)}
          dangerouslySetInnerHTML={{ __html: formatText(profile.description) }}
        />
      )}

      {!profile?.description && (
        <div className={styles.placeholder}>
          {profile?.fullname || profile?.username} пока ничего не рассказал о себе
        </div>
      )}
    </div>
  );
};

export { ProfileDescription };
