import React, { FC } from 'react';
import { Group } from '~/components/containers/Group';
import styles from './styles.scss';
import { getURL } from '~/utils/dom';
import { Icon } from '~/components/input/Icon';
import { IUser } from '~/redux/auth/types';
import { PRESETS } from '~/constants/urls';
import { Link } from 'react-router-dom';

interface IProps {
  user: Partial<IUser>;
  onLogout: () => void;
}

const UserButton: FC<IProps> = ({ user: { username, photo }, onLogout }) => (
  <div className={styles.wrap}>
    <Group horizontal className={styles.user_button}>
      <Link to={`/~${username}`}>{username}</Link>

      <div
        className={styles.user_avatar}
        style={{ backgroundImage: `url('${getURL(photo, PRESETS.avatar)}')` }}
      >
        {(!photo || !photo.id) && <Icon icon="profile" />}
      </div>
    </Group>

    <div className={styles.menu}>
      <div onClick={onLogout}>Выдох</div>
    </div>
  </div>
);

export { UserButton };
