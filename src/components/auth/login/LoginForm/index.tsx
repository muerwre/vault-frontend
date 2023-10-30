import { FC } from 'react';

import { Group } from '~/components/containers/Group';
import { Button } from '~/components/input/Button';
import { InputText } from '~/components/input/InputText';
import { useLoginForm } from '~/hooks/auth/useLoginForm';
import { IUser } from '~/types/auth';

import styles from './styles.module.scss';

interface LoginFormProps {
  login: (username: string, password: string) => Promise<IUser>;
  onSuccess: () => void;
  onRestoreRequest: () => void;
}

const LoginForm: FC<LoginFormProps> = ({
  login,
  onSuccess,
  onRestoreRequest,
}) => {
  const { values, errors, handleSubmit, handleChange } = useLoginForm(
    login,
    onSuccess,
  );

  return (
    <Group>
      <form onSubmit={handleSubmit}>
        <InputText
          title="Логин"
          handler={handleChange('username')}
          value={values.username}
          error={errors.username}
          autoFocus
        />

        <InputText
          title="Пароль"
          handler={handleChange('password')}
          value={values.password}
          error={errors.password}
          type="password"
        />

        <Button
          color="link"
          type="button"
          onClick={onRestoreRequest}
          className={styles.forgot_button}
        >
          Вспомнить пароль
        </Button>
      </form>
    </Group>
  );
};
export { LoginForm };
