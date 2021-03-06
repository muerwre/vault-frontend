import React, { FC, useMemo } from 'react';
import { IAuthState } from '~/redux/auth/types';
import { formatText, getURL } from '~/utils/dom';
import { PRESETS, URLS } from '~/constants/urls';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { Link } from 'react-router-dom';
import { Icon } from '~/components/input/Icon';
import classNames from 'classnames';

import styles from './styles.module.scss';
import markdown from '~/styles/common/markdown.module.scss';

interface IProps {
  profile: IAuthState['profile'];
  username: string;
}

const ProfilePageLeft: FC<IProps> = ({ username, profile }) => {
  const thumb = useMemo(() => {
    if (!profile || !profile.user || !profile.user.photo) return '';

    return getURL(profile.user.photo, PRESETS.small_hero);
  }, [profile]);

  return (
    <div className={styles.wrap}>
      <div className={styles.avatar} style={{ backgroundImage: `url('${thumb}')` }} />

      <div className={styles.region_wrap}>
        <div className={styles.region}>
          <div className={styles.name}>
            {profile.is_loading ? <Placeholder /> : profile?.user?.fullname}
          </div>

          <div className={styles.username}>
            {profile.is_loading ? <Placeholder /> : `~${profile?.user?.username}`}
          </div>

          <div className={styles.menu}>
            <Link to={`${URLS.PROFILE_PAGE(username)}/`}>
              <Icon icon="profile" size={20} />
              Профиль
            </Link>

            <Link to={`${URLS.PROFILE_PAGE(username)}/settings`}>
              <Icon icon="settings" size={20} />
              Настройки
            </Link>

            <Link to={`${URLS.PROFILE_PAGE(username)}/messages`}>
              <Icon icon="messages" size={20} />
              Сообщения
            </Link>
          </div>
        </div>
      </div>

      {profile && profile.user && profile.user.description && false && (
        <div className={classNames(styles.description, markdown.wrapper)}>
          {formatText(profile?.user?.description || '')}
        </div>
      )}
    </div>
  );
};

export { ProfilePageLeft };
