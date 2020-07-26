import React, { FC, useEffect, Fragment } from 'react';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { IAuthState, ISocialProvider } from '~/redux/auth/types';
import styles from './styles.scss';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { Icon } from '~/components/input/Icon';

interface IProps {
  accounts: IAuthState['profile']['socials']['accounts'];
  is_loading: boolean;
  authGetSocials: typeof AUTH_ACTIONS.authGetSocials;
  authDropSocial: typeof AUTH_ACTIONS.authDropSocial;
}

const SOCIAL_ICONS: Record<ISocialProvider, string> = {
  vkontakte: 'vk',
  google: 'google',
};

const ProfileSettingsSocials: FC<IProps> = ({
  authGetSocials,
  authDropSocial,
  accounts,
  is_loading,
}) => {
  useEffect(() => {
    authGetSocials();
  }, [authGetSocials]);

  if (!accounts.length) return null;

  return (
    <div className={styles.wrap}>
      {is_loading && (
        <div className={styles.loader}>
          {[...new Array(accounts.length || 1)].map((_, i) => (
            <Fragment key={i}>
              <Placeholder width="50%" />
              <Placeholder width="auto" />
            </Fragment>
          ))}
        </div>
      )}

      {!is_loading &&
        accounts.map(it => (
          <div className={styles.account}>
            <div className={styles.account__provider}>
              <Icon icon={SOCIAL_ICONS[it.provider]} />
            </div>

            <div className={styles.account__name}>{it.name}</div>

            <div className={styles.account__drop}>
              <Icon icon="close" size={22} onClick={() => authDropSocial(it.provider, it.id)} />
            </div>
          </div>
        ))}
    </div>
  );
};

export { ProfileSettingsSocials };
