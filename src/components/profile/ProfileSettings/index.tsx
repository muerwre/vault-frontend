import React, { FC, useCallback, useEffect, useState } from 'react';
import styles from './styles.module.scss';
import { Textarea } from '~/components/input/Textarea';
import { Button } from '~/components/input/Button';
import { Group } from '~/components/containers/Group';
import { Filler } from '~/components/containers/Filler';
import { InputText } from '~/components/input/InputText';
import { ERROR_LITERAL } from '~/constants/errors';
import { ProfileAccounts } from '~/components/profile/ProfileAccounts';
import classNames from 'classnames';
import { useUser } from '~/hooks/user/userUser';
import { useProfileContext } from '~/utils/providers/ProfileProvider';
import { showErrorToast } from '~/utils/errors/showToast';
import { getValidationErrors } from '~/utils/errors/getValidationErrors';
import { showToastSuccess } from '~/utils/toast';
import { getRandomPhrase } from '~/constants/phrases';

const ProfileSettings: FC = () => {
  const [errors, setErrors] = useState<Record<string, any>>({});
  const user = useUser();
  const { updateProfile } = useProfileContext();

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
    async event => {
      try {
        event.preventDefault();

        const fields = {
          ...data,
          password: password.length > 0 && password ? password : undefined,
          new_password: new_password.length > 0 && new_password ? new_password : undefined,
        };

        await updateProfile(fields);

        showToastSuccess(getRandomPhrase('SUCCESS'));
      } catch (error) {
        showErrorToast(error);

        const validationErrors = getValidationErrors(error);
        if (validationErrors) {
          setErrors(validationErrors);
        }
      }
    },
    [data, password, new_password, updateProfile]
  );

  useEffect(() => {
    setErrors({});
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
            error={errors.fullname && ERROR_LITERAL[errors.fullname]}
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
            error={errors.username && ERROR_LITERAL[errors.username]}
          />

          <InputText
            value={data.email}
            handler={setEmail}
            title="E-mail"
            error={errors.email && ERROR_LITERAL[errors.email]}
          />

          <InputText
            value={new_password}
            handler={setNewPassword}
            title="Новый пароль"
            type="password"
            error={errors.new_password && ERROR_LITERAL[errors.new_password]}
          />

          <InputText
            value={password}
            handler={setPassword}
            title="Старый пароль"
            type="password"
            error={errors.password && ERROR_LITERAL[errors.password]}
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

export { ProfileSettings };
