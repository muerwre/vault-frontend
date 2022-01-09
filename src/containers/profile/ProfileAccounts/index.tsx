import React, { FC, Fragment } from 'react';
import styles from './styles.module.scss';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { Icon } from '~/components/input/Icon';
import { Button } from '~/components/input/Button';
import { Group } from '~/components/containers/Group';
import { useOAuth } from '~/hooks/auth/useOAuth';
import { SOCIAL_ICONS } from '~/constants/auth/socials';

type ProfileAccountsProps = {};

const ProfileAccounts: FC<ProfileAccountsProps> = () => {
  const { isLoading, accounts, dropAccount, openOauthWindow } = useOAuth();

  return (
    <Group className={styles.wrap}>
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

      {isLoading && (
        <div className={styles.loader}>
          {[...new Array(accounts.length || 1)].map((_, i) => (
            <Fragment key={i}>
              <Placeholder width="50%" />
              <Placeholder width="auto" />
            </Fragment>
          ))}
        </div>
      )}

      {!isLoading && accounts.length > 0 && (
        <div className={styles.list}>
          {!isLoading &&
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
                  <Icon icon="close" size={22} onClick={() => dropAccount(it.provider, it.id)} />
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
          onClick={() => openOauthWindow('vkontakte')}
        >
          Вконтакте
        </Button>

        <Button
          size="small"
          type="button"
          iconLeft="google"
          color="gray"
          onClick={() => openOauthWindow('google')}
        >
          Google
        </Button>
      </Group>
    </Group>
  );
};

export { ProfileAccounts };
