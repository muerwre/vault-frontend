import { FC } from 'react';

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

        <div
          className={styles.user_avatar}
          style={{
            backgroundImage: `url('${getURL(photo, ImagePresets.avatar)}')`,
          }}
        >
          {(!photo || !photo.id) && <Icon icon="profile" />}
        </div>
      </Group>
    </button>
  );
};

export { UserButton };
