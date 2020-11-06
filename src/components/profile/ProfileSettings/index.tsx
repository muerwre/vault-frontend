import React, { FC, useCallback, useEffect, useState } from 'react';
import styles from './styles.module.scss';
import { connect } from 'react-redux';
import { selectAuthProfile, selectAuthUser } from '~/redux/auth/selectors';
import { Textarea } from '~/components/input/Textarea';
import { Button } from '~/components/input/Button';
import { Group } from '~/components/containers/Group';
import { Filler } from '~/components/containers/Filler';
import { InputText } from '~/components/input/InputText';
import { reject } from 'ramda';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { ERROR_LITERAL } from '~/constants/errors';
import { ProfileAccounts } from '~/components/profile/ProfileAccounts';
import classNames from 'classnames';

const mapStateToProps = state => ({
  user: selectAuthUser(state),
  profile: selectAuthProfile(state),
});

const mapDispatchToProps = {
  authPatchUser: AUTH_ACTIONS.authPatchUser,
  authSetProfile: AUTH_ACTIONS.authSetProfile,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const ProfileSettingsUnconnected: FC<IProps> = ({
  user,
  profile: { patch_errors, socials },
  authPatchUser,
  authSetProfile,
}) => {
  const [password, setPassword] = useState('');
  const [new_password, setNewPassword] = useState('');

  const [data, setData] = useState(user);

  const setDescription = useCallback(description => setData({ ...data, description }), [
    data,
    setData,
  ]);
  const setEmail = useCallback(email => setData({ ...data, email }), [data, setData]);
  const setUsername = useCallback(username => setData({ ...data, username }), [data, setData]);
  const setFullname = useCallback(fullname => setData({ ...data, fullname }), [data, setData]);

  const onSubmit = useCallback(
    event => {
      event.preventDefault();

      const fields = reject(el => typeof el === 'undefined')({
        email: data.email !== user.email && data.email ? data.email : undefined,
        fullname: data.fullname !== user.fullname ? data.fullname : undefined,
        username: data.username !== user.username && data.username ? data.username : undefined,
        password: password.length > 0 && password ? password : undefined,
        new_password: new_password.length > 0 && new_password ? new_password : undefined,
        description: data.description !== user.description ? data.description : undefined,
      });

      if (Object.values(fields).length === 0) return;

      authPatchUser(fields);
    },
    [data, password, new_password, authPatchUser]
  );

  useEffect(() => {
    authSetProfile({ patch_errors: {} });
  }, [password, new_password, data]);

  return (
    <form className={styles.wrap} onSubmit={onSubmit}>
      <Group>
        <Group className={styles.pad}>
          <div className={styles.pad__title}>
            <span>О себе</span>
          </div>

          <InputText
            value={data.fullname}
            handler={setFullname}
            title="Полное имя"
            error={patch_errors.fullname && ERROR_LITERAL[patch_errors.fullname]}
          />

          <Textarea value={data.description} handler={setDescription} title="Описание" />

          <div className={styles.small}>
            Описание будет видно на странице профиля. Здесь работают те же правила оформления, что и
            в комментариях.
          </div>
        </Group>

        <Filler />

        <Group className={classNames(styles.pad, styles.pad_danger)}>
          <div className={styles.pad__title}>
            <span>Логин и пароли</span>
          </div>

          <InputText
            value={data.username}
            handler={setUsername}
            title="Логин"
            error={patch_errors.username && ERROR_LITERAL[patch_errors.username]}
          />

          <InputText
            value={data.email}
            handler={setEmail}
            title="E-mail"
            error={patch_errors.email && ERROR_LITERAL[patch_errors.email]}
          />

          <InputText
            value={new_password}
            handler={setNewPassword}
            title="Новый пароль"
            type="password"
            error={patch_errors.new_password && ERROR_LITERAL[patch_errors.new_password]}
          />

          <InputText
            value={password}
            handler={setPassword}
            title="Старый пароль"
            type="password"
            error={patch_errors.password && ERROR_LITERAL[patch_errors.password]}
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

        <Group horizontal className={styles.buttons}>
          <Filler />
          <Button title="Сохранить" type="submit" />
        </Group>
      </Group>
    </form>
  );
};

const ProfileSettings = connect(mapStateToProps, mapDispatchToProps)(ProfileSettingsUnconnected);

export { ProfileSettings };
