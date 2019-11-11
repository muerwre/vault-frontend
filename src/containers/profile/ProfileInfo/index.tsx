import React, { FC } from 'react';
import { IUser } from '~/redux/auth/types';
import styles from './styles.scss';
import { Group } from '~/components/containers/Group';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { getURL, getPrettyDate } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';

interface IProps {
  user?: IUser;
  is_loading?: boolean;
}

const ProfileInfo: FC<IProps> = ({ user, is_loading = false }) => (
  <Group>
    <Group className={styles.wrap} horizontal>
      <div
        className={styles.avatar}
        style={{
          backgroundImage: `url("${user && getURL(user.photo, PRESETS.avatar)}")`,
        }}
      />

      <div className={styles.field}>
        <div className={styles.name}>
          {is_loading ? <Placeholder width="80%" /> : user.fullname || user.username}
        </div>

        <div className={styles.description}>
          {is_loading ? <Placeholder /> : getPrettyDate(user.last_seen)}
        </div>
      </div>
    </Group>
  </Group>
);

export { ProfileInfo };
