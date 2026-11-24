import { FC } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { Card } from '~/components/common/Card';
import { ProfileLink } from '~/components/profile/ProfileLink';
import { useUserDescription } from '~/hooks/auth/useUserDescription';
import { INodeUser } from '~/types';

import styles from './styles.module.scss';

interface Props {
  user?: INodeUser;
}

const NodeAuthorBlock: FC<Props> = ({ user }) => {
  const description = useUserDescription(user);

  if (!user) {
    return null;
  }

  const { fullname, username, photo } = user;

  return (
    <Card className={styles.block} elevation={-1}>
      <ProfileLink username={username}>
        <Avatar
          username={username}
          url={photo?.url}
          className={styles.avatar}
        />
      </ProfileLink>

      <div className={styles.info}>
        <div className={styles.username}>
          <ProfileLink username={username}>{fullname || username}</ProfileLink>
        </div>
        <div className={styles.description}>{description}</div>
      </div>
    </Card>
  );
};

export { NodeAuthorBlock };
