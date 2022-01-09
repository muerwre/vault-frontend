import React, { FC, useCallback, useState } from 'react';
import { BetterScrollDialog } from '~/components/dialogs/BetterScrollDialog';
import { Padder } from '~/components/containers/Padder';
import { DialogTitle } from '~/components/dialogs/DialogTitle';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import styles from './styles.module.scss';
import { useCloseOnEscape } from '~/hooks';
import { LoginSocialRegisterButtons } from '~/components/auth/oauth/LoginSocialRegisterButtons';
import { Toggle } from '~/components/input/Toggle';
import { DialogComponentProps } from '~/types/modal';
import { getRandomPhrase } from '~/constants/phrases';
import { useSocialRegisterForm } from '~/hooks/auth/useSocialRegisterForm';
import { apiLoginWithSocial } from '~/api/auth';
import { useModal } from '~/hooks/modal/useModal';
import { useAuthStore } from '~/store/auth/useAuthStore';

type LoginSocialRegisterDialogProps = DialogComponentProps & { token: string };

const phrase = getRandomPhrase('REGISTER');

const LoginSocialRegisterDialog: FC<LoginSocialRegisterDialogProps> = ({
  onRequestClose,
  token,
}) => {
  useCloseOnEscape(onRequestClose);
  const { hideModal } = useModal();
  const auth = useAuthStore();

  const [isDryingPants, setIsDryingPants] = useState(false);
  const onSuccess = useCallback(
    (loginToken: string) => {
      auth.setToken(loginToken);
      hideModal();
    },
    [auth, hideModal]
  );

  const { values, errors, handleChange, handleSubmit } = useSocialRegisterForm(
    token,
    apiLoginWithSocial,
    onSuccess
  );

  return (
    <form onSubmit={handleSubmit} autoComplete="new-password">
      <BetterScrollDialog
        onClose={onRequestClose}
        width={300}
        footer={<LoginSocialRegisterButtons />}
      >
        <Padder>
          <div className={styles.wrap}>
            <Group>
              <DialogTitle>Добро пожаловать в семью!</DialogTitle>

              <InputText
                handler={handleChange('username')}
                value={values.username}
                title="Юзернэйм"
                error={errors.username}
                autoComplete="new-password"
              />

              <InputText
                handler={handleChange('password')}
                value={values.password}
                title="Пароль"
                type="password"
                error={errors.password}
                autoComplete="new-password"
              />

              <div className={styles.check} onClick={() => setIsDryingPants(!isDryingPants)}>
                <Toggle value={isDryingPants} color="primary" />
                <span>Это не мои штаны сушатся на радиаторе в третьей лаборатории</span>
              </div>

              <div className={styles.check} onClick={() => setIsDryingPants(!isDryingPants)}>
                <Toggle value={!isDryingPants} color="primary" />
                <span>{phrase}</span>
              </div>
            </Group>
          </div>
        </Padder>
      </BetterScrollDialog>
    </form>
  );
};

export { LoginSocialRegisterDialog };
