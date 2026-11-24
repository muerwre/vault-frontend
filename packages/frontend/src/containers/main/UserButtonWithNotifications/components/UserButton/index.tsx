import { FC, Ref } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { Group } from '~/components/common/Group';
import { imagePresets } from '~/constants/urls';
import { IFile } from '~/types';
import { getURL } from '~/utils/dom';

import styles from './styles.module.scss';

interface Props {
  username: string;
  photo?: IFile;
  hasUpdates?: boolean;

  onClick?: () => void;
}

/** The username and avatar, for a button or a menu to wrap. */
const UserButtonFace: FC<
  Omit<Props, 'onClick'> & { avatarRef?: Ref<HTMLDivElement> }
> = ({ username, photo, hasUpdates, avatarRef }) => (
  <Group horizontal className={styles.user_button}>
    <div className={styles.username}>{username}</div>
    <Avatar
      ref={avatarRef}
      url={getURL(photo, imagePresets.avatar)}
      size={32}
      hasUpdates={hasUpdates}
    />
  </Group>
);

const UserButton: FC<Props> = ({ onClick, ...face }) => (
  <button className={styles.wrap} onClick={onClick}>
    <UserButtonFace {...face} />
  </button>
);

export { UserButton, UserButtonFace };
