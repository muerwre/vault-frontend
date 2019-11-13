import React, { FC, useState, useEffect, useCallback } from 'react';
import styles from './styles.scss';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { selectAuthUser, selectAuthProfile } from '~/redux/auth/selectors';
import { Textarea } from '~/components/input/Textarea';
import { Button } from '~/components/input/Button';
import { Group } from '~/components/containers/Group';
import { Filler } from '~/components/containers/Filler';
import { TextInput } from '~/components/input/TextInput';
import { InputText } from '~/components/input/InputText';
import reject from 'ramda/es/reject';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { ERROR_LITERAL } from '~/constants/errors';

const mapStateToProps = state => ({
  user: selectAuthUser(state),
  profile: selectAuthProfile(state),
});

const mapDispatchToProps = {
  authPatchUser: AUTH_ACTIONS.authPatchUser,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const ProfileSettingsUnconnected: FC<IProps> = ({
  user,
  authPatchUser,
  profile: { patch_errors },
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

  const onSubmit = useCallback(
    event => {
      event.preventDefault();

      const fields = reject(el => !el)({
        email: data.email !== user.email && data.email,
        username: data.username !== user.username && data.username,
        password: password.length > 0 && password,
        new_password: new_password.length > 0 && new_password,
        description: data.description !== user.description && data.description,
      });

      if (Object.values(fields).length === 0) return;

      authPatchUser(fields);
    },
    [data, password, new_password, authPatchUser]
  );

  return (
    <form className={styles.wrap} onSubmit={onSubmit}>
      <Group>
        <Textarea value={data.description} handler={setDescription} title="Описание" />

        <div className={styles.small}>
          Описание будет видно на странице профиля. Здесь работают те же правила оформления, что и в
          комментариях.
        </div>

        <Group className={styles.pad}>
          <InputText
            value={data.username}
            handler={setUsername}
            title="Логин"
            error={patch_errors.username && ERROR_LITERAL[patch_errors.username]}
          />

          <InputText value={data.email} handler={setEmail} title="E-mail" />

          <InputText
            value={new_password}
            handler={setNewPassword}
            title="Новый пароль"
            type="password"
            error={patch_errors.new_password && ERROR_LITERAL[patch_errors.new_password]}
          />

          <div />

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
        </Group>

        <Group horizontal>
          <Filler />
          <Button title="Сохранить" type="submit" />
        </Group>
      </Group>
    </form>
  );
};

const ProfileSettings = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileSettingsUnconnected);

export { ProfileSettings };
