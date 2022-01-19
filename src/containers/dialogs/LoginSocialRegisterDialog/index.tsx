import React, { FC, useCallback, useState } from 'react';

import { apiLoginWithSocial } from '~/api/auth';
import { LoginSocialRegisterButtons } from '~/components/auth/oauth/LoginSocialRegisterButtons';
import { Group } from '~/components/containers/Group';
import { Padder } from '~/components/containers/Padder';
import { BetterScrollDialog } from '~/components/dialogs/BetterScrollDialog';
import { DialogTitle } from '~/components/dialogs/DialogTitle';
import { InputText } from '~/components/input/InputText';
import { Toggle } from '~/components/input/Toggle';
import { getRandomPhrase } from '~/constants/phrases';
import { useCloseOnEscape } from '~/hooks';
import { useSocialRegisterForm } from '~/hooks/auth/useSocialRegisterForm';
import { useModal } from '~/hooks/modal/useModal';
import { useAuthStore } from '~/store/auth/useAuthStore';
import { DialogComponentProps } from '~/types/modal';

import styles from './styles.module.scss';

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
