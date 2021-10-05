import React, { FC, useCallback } from 'react';
import { INode } from '~/redux/types';
import styles from './styles.module.scss';
import { Avatar } from '~/components/common/Avatar';
import { openUserProfile } from '~/utils/user';
import { useUserDescription } from '~/utils/hooks/user/useUserDescription';

interface Props {
  node?: INode;
}

const NodeAuthorBlock: FC<Props> = ({ node }) => {
  const onOpenProfile = useCallback(() => openUserProfile(node?.user?.username), [
    node?.user?.username,
  ]);

  const description = useUserDescription(node?.user);

  if (!node?.user) {
    return null;
  }

  const { fullname, username, photo } = node.user;

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
