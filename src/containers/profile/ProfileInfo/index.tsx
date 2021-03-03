import React, { FC, ReactNode } from 'react';
import { IAuthState, IUser } from '~/redux/auth/types';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { getPrettyDate } from '~/utils/dom';
import { ProfileTabs } from '../ProfileTabs';
import { ProfileAvatar } from '../ProfileAvatar';

interface IProps {
  user?: IUser;
  tab: string;

  is_loading?: boolean;
  is_own?: boolean;

  setTab?: (tab: IAuthState['profile']['tab']) => void;

  content?: ReactNode;
}

const ProfileInfo: FC<IProps> = ({ user, tab, is_loading, is_own, setTab, content = null }) => (
  <div>
    <Group className={styles.wrap} horizontal>
      <ProfileAvatar />

      <div className={styles.field}>
        <div className={styles.name}>
          {is_loading ? <Placeholder width="80%" /> : user?.fullname || user?.username}
        </div>

        <div className={styles.description}>
          {is_loading ? <Placeholder /> : getPrettyDate(user?.last_seen)}
        </div>
      </div>
    </Group>

    <ProfileTabs tab={tab} is_own={!!is_own} setTab={setTab} />

    {content}
  </div>
);

export { ProfileInfo };
