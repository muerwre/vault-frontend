import React, { FC, useCallback } from 'react';
import { INode } from '~/redux/types';
import styles from './styles.module.scss';
import { CommentAvatar } from '~/components/comment/CommentAvatar';
import { openUserProfile } from '~/utils/user';

interface Props {
  node?: INode;
}

const NodeAuthorBlock: FC<Props> = ({ node }) => {
  if (!node?.user) {
    return null;
  }

  const { fullname, username, description, photo } = node.user;

  const onOpenProfile = useCallback(() => openUserProfile(username), [username]);

  return (
    <div className={styles.block} onClick={onOpenProfile}>
      <CommentAvatar username={username} url={photo?.url} className={styles.avatar} />

      <div className={styles.info}>
        <div className={styles.username}>{fullname || username}</div>
        {description && <div className={styles.description}>{description}</div>}
      </div>
    </div>
  );
};

export { NodeAuthorBlock };
