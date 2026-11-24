import { FC, useCallback } from 'react';

import { MAX_PROFILE_LINKS } from '@vault/common/constants';

import { Card } from '~/components/common/Card';
import { Group } from '~/components/common/Group';
import { Zone } from '~/components/common/Zone';
import { InputText } from '~/components/input/InputText';
import { Textarea } from '~/components/input/Textarea';
import { ProfilePhotoEditor } from '~/components/profile/ProfilePhotoEditor';
import { SuperPowersToggle } from '~/containers/auth/SuperPowersToggle';
import { ProfileAccounts } from '~/containers/profile/ProfileAccounts';
import { ProfileCoverEditor } from '~/containers/profile/ProfileCoverEditor';
import { ThemeSwitcher } from '~/containers/settings/ThemeSwitcher';
import { usePatchUser } from '~/hooks/auth/usePatchUser';
import { useUser } from '~/hooks/auth/useUser';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useSettings } from '~/utils/providers/SettingsProvider';

import styles from './styles.module.scss';

interface UserSettingsViewProps {}

const AVATAR_SIZE = 160;

/**
 * The links as inputs: the ones there are, then a single empty one to add the
 * next, until the limit. Emptied inputs stay while being edited, so typing is
 * not thrown off; blanks are dropped on save.
 */
const toLinkInputs = (links: string[] = []): string[] => {
  const inputs = [...links];

  while (
    inputs.length > 1 &&
    !inputs[inputs.length - 1] &&
    !inputs[inputs.length - 2]
  ) {
    inputs.pop();
  }

  if (
    inputs.length < MAX_PROFILE_LINKS &&
    (inputs.length === 0 || inputs[inputs.length - 1])
  ) {
    inputs.push('');
  }

  return inputs;
};

const UserSettingsView: FC<UserSettingsViewProps> = () => {
  const { values, handleChange, errors, setFieldValue } = useSettings();
  const { isPhone } = useWindowSize();
  const { user } = useUser();
  const { updatePhoto, deletePhoto } = usePatchUser();

  const linkInputs = toLinkInputs(values.links);

  const setLink = useCallback(
    (index: number) => (value: string) =>
      setFieldValue(
        'links',
        toLinkInputs(linkInputs.map((it, i) => (i === index ? value : it))),
      ),
    [linkInputs, setFieldValue],
  );

  return (
    <Card.Row columns>
      <Card.Column>
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
                  Описание будет показываться при клике наведении на вашу
                  аватарку.
                </div>
              </Group>
            </Zone>
          </Group>

          <Zone color="danger" title="Логин и пароли">
            <Group>
              <InputText
                value={values.username}
                handler={handleChange('username')}
                title="Логин"
                error={errors.username}
              />

              {/* Password resets trust it, so it cannot be changed here. */}
              <InputText
                value={values.email}
                handler={() => {}}
                title="E-mail"
                error={errors.email}
                readOnly
                disabled
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

          <Zone className={styles.pad} title="Аккаунты">
            <ProfileAccounts />
          </Zone>
        </Group>
      </Card.Column>

      <Card.Column>
        <Group>
          <Zone title="Ссылки">
            <Group>
              {linkInputs.map((link, index) => (
                <InputText
                  key={index}
                  value={link}
                  handler={setLink(index)}
                  placeholder="https://"
                  type="url"
                />
              ))}

              {typeof errors.links === 'string' && (
                <div className={styles.error}>{errors.links}</div>
              )}
            </Group>
          </Zone>

          <Zone title="Тема">
            <ThemeSwitcher />
          </Zone>

          <Zone title="Фон профиля">
            <ProfileCoverEditor />
          </Zone>

          <div className={styles.superpowers}>
            <SuperPowersToggle />
          </div>
        </Group>
      </Card.Column>
    </Card.Row>
  );
};

export { UserSettingsView };
