import React, { FC, useCallback } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { useUserDescription } from '~/hooks/auth/useUserDescription';
import { INodeUser } from '~/types';
import { openUserProfile } from '~/utils/user';

import styles from './styles.module.scss';

interface Props {
  user?: INodeUser;
}

const NodeAuthorBlock: FC<Props> = ({ user }) => {
  const onOpenProfile = useCallback(() => openUserProfile(user?.username), [user]);

  const description = useUserDescription(user);

  if (!user) {
    return null;
  }

  const { fullname, username, photo } = user;

  return (
    <div className={styles.block} onClick={onOpenProfile}>
      <Avatar username={username} url={photo?.url} className={styles.avatar} />

      <div className={styles.info}>
        <div className={styles.username}>{fullname || username}</div>
        <div className={styles.description}>{description}</div>
      </div>
    </div>
  );
};

export { NodeAuthorBlock };
