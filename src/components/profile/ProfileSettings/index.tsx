import React, { FC } from 'react';

import classNames from 'classnames';

import { Superpower } from '~/components/boris/Superpower';
import { Filler } from '~/components/containers/Filler';
import { Group } from '~/components/containers/Group';
import { Button } from '~/components/input/Button';
import { InputText } from '~/components/input/InputText';
import { Textarea } from '~/components/input/Textarea';
import { ERROR_LITERAL } from '~/constants/errors';
import { ProfileAccounts } from '~/containers/profile/ProfileAccounts';
import { usePatchUser } from '~/hooks/auth/usePatchUser';
import { useUser } from '~/hooks/auth/useUser';
import { useSettingsForm } from '~/utils/providers/SettingsProvider';
import { has } from '~/utils/ramda';

import styles from './styles.module.scss';

const getError = (error?: string) => (error && has(error, ERROR_LITERAL) ? error : undefined);

const ProfileSettings: FC = () => {
  const { user } = useUser();
  const { save } = usePatchUser();

  const { handleSubmit, values, errors, handleChange } = useSettingsForm(
    { ...user, password: '', newPassword: '' },
    save
  );

  return (
    <form className={styles.wrap} onSubmit={handleSubmit}>
      <Group>
        <Group horizontal className={styles.base_info}>
          <Superpower>
            <div className={classNames(styles.avatar, styles.pad)}>
              <div className={styles.pad__title}>
                <span>Фото</span>
                <small>Будет здесь. Кстати, ты видишь это, потому что включил суперсилы в Борисе.</small>
              </div>
            </div>
          </Superpower>

          <Group className={styles.pad}>
            <div className={styles.pad__title}>
              <span>О себе</span>
            </div>

            <InputText
              value={values.fullname}
              handler={handleChange('fullname')}
              title="Полное имя"
              error={getError(errors.fullname)}
            />

            <Textarea
              value={values.description}
              handler={handleChange('description')}
              title="Описание"
            />

            <div className={styles.small}>
              Описание будет показываться при клике наведении на вашу аватарку.
            </div>
          </Group>
        </Group>

        <Superpower>
          <div className={styles.pad}>
            <div className={styles.pad__title}>
              <span>Обложка</span>
              <small>Будет здесь. Кстати, ты видишь это, потому что включил суперсилы в Борисе.</small>
              <br />
              <br />
              <br />
              <br />
              <br />
            </div>
          </div>
        </Superpower>

        <Filler />

        <Group className={classNames(styles.pad, styles.pad_danger)}>
          <div className={styles.pad__title}>
            <span>Логин и пароли</span>
          </div>

          <InputText
            value={values.username}
            handler={handleChange('username')}
            title="Логин"
            error={getError(errors.username)}
          />

          <InputText
            value={values.email}
            handler={handleChange('email')}
            title="E-mail"
            error={getError(errors.email)}
          />

          <InputText
            value={values.newPassword}
            handler={handleChange('newPassword')}
            title="Новый пароль"
            type="password"
            error={getError(errors.newPassword)}
          />

          <InputText
            value={values.password}
            handler={handleChange('password')}
            title="Старый пароль"
            type="password"
            error={getError(errors.password)}
          />

          <div className={styles.small}>
            Чтобы изменить любое из этих полей, нужно ввести старый пароль.
          </div>

          <Filler />
        </Group>

        <Filler />

        <Filler />

        <div className={styles.pad}>
          <div className={styles.pad__title}>
            <span>Аккаунты</span>
          </div>

          <ProfileAccounts />
        </div>

        <Superpower>
          <div className={styles.pad}>
            <div className={styles.pad__title}>
              <span>Всякие приятные штуковины</span>
              <small>Будут здесь. Кстати, ты видишь это, потому что включил суперсилы в Борисе.</small>
              <br />
            </div>
          </div>
        </Superpower>

        <Group horizontal className={styles.buttons}>
          <Filler />
          <Button title="Сохранить" type="submit" />
        </Group>
      </Group>
    </form>
  );
};

export { ProfileSettings };
