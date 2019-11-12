import React, { FC } from 'react';
import { IUser } from '~/redux/auth/types';
import styles from './styles.scss';
import { Group } from '~/components/containers/Group';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { getURL, getPrettyDate } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import { ProfileTabs } from '../ProfileTabs';
import { MessageForm } from '~/components/profile/MessageForm';

interface IProps {
  user?: IUser;
  tab: string;

  is_loading?: boolean;
  is_own?: boolean;

  setTab?: (tab: string) => void;
}

const TAB_HEADERS = {
  messages: <MessageForm is_sending_message={false} />,
};

const ProfileInfo: FC<IProps> = ({ user, tab, is_loading, is_own, setTab }) => (
  <div>
    <Group className={styles.wrap} horizontal>
      <div
        className={styles.avatar}
        style={{
          backgroundImage: is_loading
            ? null
            : `url("${user && getURL(user.photo, PRESETS.avatar)}")`,
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

    <ProfileTabs tab={tab} is_own={is_own} setTab={setTab} />

    {TAB_HEADERS[tab] || null}
  </div>
);

export { ProfileInfo };
