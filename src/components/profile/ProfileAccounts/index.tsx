import React, { FC, Fragment, useCallback, useEffect } from 'react';
import { ISocialProvider } from '~/redux/auth/types';
import styles from './styles.module.scss';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { Icon } from '~/components/input/Icon';
import { Button } from '~/components/input/Button';
import { Group } from '~/components/containers/Group';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { selectAuthProfile } from '~/redux/auth/selectors';
import { IState } from '~/redux/store';
import { connect } from 'react-redux';
import { API } from '~/constants/api';
import { ProfileAccountsError } from '~/components/profile/ProfileAccountsError';

const mapStateToProps = (state: IState) => selectAuthProfile(state).socials;
const mapDispatchToProps = {
  authGetSocials: AUTH_ACTIONS.authGetSocials,
  authDropSocial: AUTH_ACTIONS.authDropSocial,
  authAttachSocial: AUTH_ACTIONS.authAttachSocial,
  authSetSocials: AUTH_ACTIONS.authSetSocials,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const SOCIAL_ICONS: Record<ISocialProvider, string> = {
  vkontakte: 'vk',
  google: 'google',
};

const ProfileAccountsUnconnected: FC<IProps> = ({
  authGetSocials,
  authDropSocial,
  authAttachSocial,
  authSetSocials,
  accounts,
  is_loading,
  error,
}) => {
  const onMessage = useCallback(
    (event: MessageEvent) => {
      if (!event?.data?.type) return;

      switch (event?.data?.type) {
        case 'oauth_processed':
          return authAttachSocial(event?.data?.payload?.token);
        case 'oauth_error':
          return authSetSocials({ error: event?.data?.payload?.error || '' });
        default:
          return;
      }
    },
    [authAttachSocial, authSetSocials]
  );

  const openOauthWindow = useCallback(
    (provider: ISocialProvider) => () => {
      window.open(API.USER.OAUTH_WINDOW(provider), '', 'width=600,height=400');
    },
    []
  );

  const resetErrors = useCallback(() => authSetSocials({ error: '' }), [authSetSocials]);

  useEffect(() => {
    authGetSocials();
  }, [authGetSocials]);

  useEffect(() => {
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onMessage]);

  return (
    <Group className={styles.wrap}>
      {error && <ProfileAccountsError onClose={resetErrors} error={error} />}

      <Group className={styles.info}>
        <p>
          Ты можешь входить в Убежище, используя аккаунты на других сайтах вместо ввода логина и
          пароля.
        </p>

        <p>
          Мы честно украдём и будем хранить твои имя, фото и адрес на этом сайте, но никому о них не
          расскажем.
        </p>
      </Group>

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

      {!is_loading && accounts.length > 0 && (
        <div className={styles.list}>
          {!is_loading &&
            accounts.map(it => (
              <div className={styles.account} key={`${it.provider}-${it.id}`}>
                <div
                  className={styles.account__photo}
                  style={{ backgroundImage: it.photo ? `url(${it.photo})` : 'none' }}
                >
                  <div className={styles.account__provider}>
                    <Icon icon={SOCIAL_ICONS[it.provider]} size={12} />
                  </div>
                </div>

                <div className={styles.account__name}>{it.name || it.id}</div>

                <div className={styles.account__drop}>
                  <Icon icon="close" size={22} onClick={() => authDropSocial(it.provider, it.id)} />
                </div>
              </div>
            ))}
        </div>
      )}

      <Group horizontal className={styles.buttons}>
        <Button
          size="small"
          type="button"
          iconLeft="vk"
          color="gray"
          onClick={openOauthWindow('vkontakte')}
        >
          Вконтакте
        </Button>

        <Button
          size="small"
          type="button"
          iconLeft="google"
          color="gray"
          onClick={openOauthWindow('google')}
        >
          Google
        </Button>
      </Group>
    </Group>
  );
};

const ProfileAccounts = connect(mapStateToProps, mapDispatchToProps)(ProfileAccountsUnconnected);

export { ProfileAccounts };
