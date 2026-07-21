import { FC } from 'react';

import classNames from 'classnames';

import { Group } from '~/components/common/Group';
import { ProfileLoader } from '~/containers/profile/ProfileLoader';
import { useUser } from '~/hooks/auth/useUser';
import markdown from '~/styles/common/markdown.module.scss';
import { formatText } from '~/utils/dom';
import { useProfileContext } from '~/utils/providers/ProfileProvider';

import styles from './styles.module.scss';

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
