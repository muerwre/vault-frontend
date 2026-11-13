import { FC } from 'react';

import { Filler } from '~/components/common/Filler';
import { Group } from '~/components/common/Group';
import { Superpower } from '~/components/common/Superpower';
import { Zone } from '~/components/common/Zone';
import { InputText } from '~/components/input/InputText';
import { Textarea } from '~/components/input/Textarea';
import { ProfilePhotoEditor } from '~/components/profile/ProfilePhotoEditor';
import { ProfileAccounts } from '~/containers/profile/ProfileAccounts';
import { usePatchUser } from '~/hooks/auth/usePatchUser';
import { useUser } from '~/hooks/auth/useUser';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useSettings } from '~/utils/providers/SettingsProvider';

import styles from './styles.module.scss';

interface UserSettingsViewProps {}

const AVATAR_SIZE = 160;

const UserSettingsView: FC<UserSettingsViewProps> = () => {
  const { values, handleChange, errors } = useSettings();
  const { isPhone } = useWindowSize();
  const { user } = useUser();
  const { updatePhoto, deletePhoto } = usePatchUser();

  return (
    <Group>
      <Group horizontal={!isPhone} className={styles.base_info}>
        <ProfilePhotoEditor
          photo={user.photo}
          size={AVATAR_SIZE}
          onUpload={updatePhoto}
          onDelete={deletePhoto}
        />

        <Zone title="О себе" className={styles.about}>
          <Group>
            <InputText
              value={values.fullname}
              handler={handleChange('fullname')}
              title="Полное имя"
              error={errors.fullname}
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
        </Zone>
      </Group>

      <Superpower>
        <Zone title="Обложка">
          <small>
            Будет здесь. Кстати, ты видишь это, потому что включил суперсилы в
            Борисе.
          </small>
          <br />
          <br />
          <br />
          <br />
          <br />
        </Zone>
      </Superpower>

      <Filler />

      <Zone color="danger" title="Логин и пароли">
        <Group>
          <InputText
            value={values.username}
            handler={handleChange('username')}
            title="Логин"
            error={errors.username}
          />

          <InputText
            value={values.email}
            handler={handleChange('email')}
            title="E-mail"
            error={errors.email}
          />

          <InputText
            value={values.newPassword}
            handler={handleChange('newPassword')}
            title="Новый пароль"
            type="password"
            error={errors.newPassword}
          />

          <InputText
            value={values.password}
            handler={handleChange('password')}
            title="Старый пароль"
            type="password"
            error={errors.password}
          />

          <div className={styles.small}>
            Чтобы изменить любое из этих полей, нужно ввести старый пароль.
          </div>
        </Group>
      </Zone>

      <Filler />

      <Filler />

      <Zone className={styles.pad} title="Аккаунты">
        <ProfileAccounts />
      </Zone>

      <Superpower>
        <Zone title="Всякие приятные штуковины">
          <small>
            Будут здесь. Кстати, ты видишь это, потому что включил суперсилы в
            Борисе.
          </small>
          <br />
        </Zone>
      </Superpower>
    </Group>
  );
};

export { UserSettingsView };
