import React, { FC, useCallback } from 'react';
import { INode } from '~/redux/types';
import styles from './styles.module.scss';
import { CommentAvatar } from '~/components/comment/CommentAvatar';
import { openUserProfile } from '~/utils/user';
import { useRandomPhrase } from '~/constants/phrases';

interface Props {
  node?: INode;
}

const NodeAuthorBlock: FC<Props> = ({ node }) => {
  const randomPhrase = useRandomPhrase('USER_DESCRIPTION');

  const onOpenProfile = useCallback(() => openUserProfile(node?.user?.username), [
    node?.user?.username,
  ]);

  if (!node?.user) {
    return null;
  }

  const { fullname, username, description, photo } = node.user;

  return (
    <div className={styles.block} onClick={onOpenProfile}>
      <CommentAvatar username={username} url={photo?.url} className={styles.avatar} />

      <div className={styles.info}>
        <div className={styles.username}>{fullname || username}</div>

        <div className={styles.description}>{description || randomPhrase}</div>
      </div>
    </div>
  );
};

export { NodeAuthorBlock };
