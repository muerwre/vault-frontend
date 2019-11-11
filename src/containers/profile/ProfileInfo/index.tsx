import React, { FC } from 'react';
import { IUser } from '~/redux/auth/types';
import styles from './styles.scss';
import { Grid } from '~/components/containers/Grid';
import { Group } from '~/components/containers/Group';
import { Placeholder } from '~/components/placeholders/Placeholder';

interface IProps {
  user?: IUser;
  is_loading?: boolean;
}

const ProfileInfo: FC<IProps> = ({ user, is_loading = false }) => (
  <Group className={styles.wrap} horizontal>
    <div className={styles.avatar} />

    <Group className={styles.field}>
      <div className={styles.name}>{is_loading ? <Placeholder width="80%" /> : 'User Name'}</div>

      <div className={styles.desription}>
        {is_loading ? <Placeholder /> : 'Some description here'}
      </div>
    </Group>
  </Group>
);

export { ProfileInfo };
