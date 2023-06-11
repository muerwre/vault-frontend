import React, { FC } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { Card } from '~/components/containers/Card';
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
      <Avatar username={username} url={photo?.url} className={styles.avatar} />

      <div className={styles.info}>
        <div className={styles.username}>{fullname || username}</div>
        <div className={styles.description}>{description}</div>
      </div>
    </Card>
  );
};

export { NodeAuthorBlock };
