import { FC } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { Group } from '~/components/containers/Group';
import { Icon } from '~/components/input/Icon';
import { ImagePresets } from '~/constants/urls';
import { IFile } from '~/types';
import { getURL } from '~/utils/dom';

import styles from './styles.module.scss';

interface IProps {
  username: string;
  photo?: IFile;
  onClick?: () => void;
}

const UserButton: FC<IProps> = ({ username, photo, onClick }) => {
  return (
    <button className={styles.wrap} onClick={onClick}>
      <Group horizontal className={styles.user_button}>
        <div className={styles.username}>{username}</div>
        <Avatar url={getURL(photo, ImagePresets.avatar)} size={32} />
      </Group>
    </button>
  );
};

export { UserButton };
