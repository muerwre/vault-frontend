import React, { FC } from 'react';
import { formatText } from '~/utils/dom';
import styles from './styles.module.scss';
import { ProfileLoader } from '~/containers/profile/ProfileLoader';
import { Group } from '~/components/containers/Group';
import markdown from '~/styles/common/markdown.module.scss';
import classNames from 'classnames';
import { useProfileContext } from '~/utils/providers/ProfileProvider';
import { useUser } from '~/hooks/auth/useUser';

const ProfileDescription: FC = () => {
  const { profile, isLoading } = useProfileContext();
  const { user } = useUser();

  const isOwn = user?.id === profile?.id;
  const description = isOwn ? user.description : profile.description;
  const fullName = isOwn ? user.fullname : profile.fullname;
  const username = isOwn ? user.username : profile.username;

  if (isLoading) return <ProfileLoader />;

  return (
    <div className={styles.wrap}>
      {!!description ? (
        <Group
          className={classNames(styles.content, markdown.wrapper)}
          dangerouslySetInnerHTML={{ __html: formatText(description) }}
        />
      ) : (
        <div className={styles.placeholder}>
          {fullName || username} пока ничего не рассказал о себе
        </div>
      )}
    </div>
  );
};

export { ProfileDescription };
